import type { BoundedRetrievalResult } from '@peekaplate/contracts';
import { describe, expect, it } from 'vitest';
import {
  codePointToUtf16Offset,
  convertSpanToCodePoints,
  convertSpanToUtf16,
  prepareS3Vis01Handoff,
  transformRetrievalToVis02Evidence,
  utf16ToCodePointOffset,
  type Vis02ExtractionHandoff,
  validateSpanSourceSlice,
} from './handoff';

describe('S3-VIS-04 × VIS-02 Compatibility Adapter & Handoff Integration', () => {
  const samplePassageText = 'Heirloom Tomato Salad with burrata, balsamic reduction: $16.50';
  const sampleSha = 'd8b2e3f4a5c60123456789abcdef0123456789abcdef0123456789abcdef1234';
  const sampleSuccessResult: BoundedRetrievalResult = {
    schema_version: 1,
    status: 'success',
    passages: [
      {
        passage_id: 'pass_web_1_0_62',
        source: {
          source_id: `sha256:${sampleSha}`,
          segment_id: `sha256:${sampleSha}#page-1`,
          source_sha256: sampleSha,
          original_url: 'https://bistro.example.com/menu',
          final_url: 'https://bistro.example.com/menu.html',
          retrieved_at: '2026-10-22T20:00:00.000Z',
        },
        text: samplePassageText,
        start_offset: 0,
        end_offset: samplePassageText.length,
        rank: 1,
        score: 0.94,
      },
    ],
    warnings: [],
  };

  describe('Requirement 1 & 4: Provenance, source identity and decoupled structure', () => {
    it('transforms bounded retrieval into decoupled VIS-02 drafts[] and evidence[] linked by draft_id', () => {
      const { drafts, evidence, warnings } = transformRetrievalToVis02Evidence(sampleSuccessResult);

      expect(drafts).toHaveLength(1);
      expect(evidence).toHaveLength(1);
      expect(warnings).toHaveLength(0);

      const draft = drafts[0]!;
      const ev = evidence[0]!;

      // 1. Linked by draft_id and draft_index
      expect(draft.source_id).toBe(`sha256:${sampleSha}`);
      expect(ev.draft_id).toBe('draft_pass_web_1_0_62');
      expect(ev.draft_index).toBe(0);

      // 2. Strict review boundary preserved
      expect(draft.status).toBe('needs_review');

      // 3. Price heuristic removed: no ungrounded price fabrication
      expect(draft.price_amount).toBeNull();
      expect(
        draft.review_warnings.some((w) =>
          w.includes('price and entity grounding require downstream LLM extraction'),
        ),
      ).toBe(true);

      // 4. Evidence span preserves segment identity
      expect(ev.spans).toHaveLength(1);
      expect(ev.spans[0]?.segment_id).toBe(`sha256:${sampleSha}#page-1`);
      expect(ev.spans[0]?.start).toBe(0);
      expect(ev.spans[0]?.end).toBe(samplePassageText.length);
    });

    it('preserves URL provenance fields in retrieval passages', () => {
      const passage = sampleSuccessResult.passages[0]!;
      expect(passage.source.source_sha256).toBe(sampleSha);
      expect(passage.source.original_url).toBe('https://bistro.example.com/menu');
      expect(passage.source.final_url).toBe('https://bistro.example.com/menu.html');
      expect(passage.source.retrieved_at).toBe('2026-10-22T20:00:00.000Z');
    });

    it('preserves candidate structure and decoupled evidence in prepareS3Vis01Handoff', () => {
      const handoff = prepareS3Vis01Handoff(sampleSuccessResult, {
        dishName: 'Heirloom Tomato Salad',
        currency: 'USD',
      });

      expect(handoff.readyForIngestion).toBe(true);
      expect(handoff.retrievalStatus).toBe('success');
      expect(handoff.candidates).toHaveLength(1);
      expect(handoff.decoupledEvidence).toHaveLength(1);

      const candidate = handoff.candidates[0]!;
      expect(candidate.name).toBe('Heirloom Tomato Salad');
      expect(candidate.price_currency).toBe('USD');
      // Price regex removed from candidate generation
      expect(candidate.price_amount).toBeUndefined();
      expect(candidate.status).toBe('needs_review');
      expect(candidate.evidence.spans[0]?.segment_id).toBe(`sha256:${sampleSha}#page-1`);
    });
  });

  describe('Requirement 2: Unicode code-point vs UTF-16 offset semantics', () => {
    // Concrete test case from Mohammad: 'Soup 🍜 $8.50'
    const emojiMenuText = 'Soup 🍜 $8.50';

    it('calculates exact offsets across emoji boundaries under both conventions', () => {
      // In JS (UTF-16 code units), '🍜' (U+1F35C) takes 2 code units
      expect(emojiMenuText.length).toBe(13);
      // In Python (Unicode code points), '🍜' is 1 code point
      expect(Array.from(emojiMenuText).length).toBe(12);

      const jsPriceStart = emojiMenuText.indexOf('$8.50'); // 8
      const jsPriceEnd = jsPriceStart + '$8.50'.length; // 13

      // Convert to Python Unicode code points
      const cpPriceStart = utf16ToCodePointOffset(emojiMenuText, jsPriceStart);
      const cpPriceEnd = utf16ToCodePointOffset(emojiMenuText, jsPriceEnd);

      expect(cpPriceStart).toBe(7);
      expect(cpPriceEnd).toBe(12);

      // Verify slice equality in both domains
      expect(emojiMenuText.slice(jsPriceStart, jsPriceEnd)).toBe('$8.50');
      expect(Array.from(emojiMenuText).slice(cpPriceStart, cpPriceEnd).join('')).toBe('$8.50');

      // Round-trip conversion
      expect(codePointToUtf16Offset(emojiMenuText, cpPriceStart)).toBe(jsPriceStart);
      expect(codePointToUtf16Offset(emojiMenuText, cpPriceEnd)).toBe(jsPriceEnd);
    });

    it('converts spans between UTF-16 and Unicode code-point representations', () => {
      const utf16Span = { segment_id: 'seg_emoji', start: 8, end: 13 };
      const cpSpan = convertSpanToCodePoints(emojiMenuText, utf16Span);

      expect(cpSpan).toEqual({ segment_id: 'seg_emoji', start: 7, end: 12 });

      const backToUtf16 = convertSpanToUtf16(emojiMenuText, cpSpan);
      expect(backToUtf16).toEqual(utf16Span);
    });

    it('validates exact source-slice equality against segment text', () => {
      const validCheck = validateSpanSourceSlice(
        emojiMenuText,
        { segment_id: 'seg_emoji', start: 7, end: 12 },
        '$8.50',
        'codepoint',
      );
      expect(validCheck.valid).toBe(true);
      expect(validCheck.actualSlice).toBe('$8.50');

      const invalidCheck = validateSpanSourceSlice(
        emojiMenuText,
        { segment_id: 'seg_emoji', start: 0, end: 4 },
        'Stew', // Expected 'Soup' but text is 'Stew'
        'codepoint',
      );
      expect(invalidCheck.valid).toBe(false);
      expect(invalidCheck.actualSlice).toBe('Soup');
      expect(invalidCheck.error).toContain('does not match expected passage text');
    });

    it('rejects a case where span length matches but content differs', () => {
      // 4 characters long, but wrong slice
      const check = validateSpanSourceSlice(
        'Beef Taco and Fish Taco',
        { segment_id: 'seg_taco', start: 0, end: 9 }, // 'Beef Taco'
        'Fish Taco', // Length is 9, but text at [0, 9] is 'Beef Taco'
        'utf16',
      );
      expect(check.valid).toBe(false);
      expect(check.actualSlice).toBe('Beef Taco');
    });

    it('rejects out-of-range or inverted spans', () => {
      expect(
        validateSpanSourceSlice('Short', { segment_id: 'seg', start: 10, end: 20 }, 'anything')
          .valid,
      ).toBe(false);

      expect(
        validateSpanSourceSlice('Short', { segment_id: 'seg', start: 4, end: 2 }, 'anything').valid,
      ).toBe(false);
    });
  });

  describe('Requirement 3: Price grounding and currency handling', () => {
    it('does NOT infer or default currency to USD when currency is omitted', () => {
      const handoff = prepareS3Vis01Handoff(sampleSuccessResult, {
        dishName: 'Heirloom Tomato Salad',
      });
      expect(handoff.candidates[0]?.price_currency).toBeUndefined();
    });

    it('does NOT infer currency from symbol like $', () => {
      const handoff = prepareS3Vis01Handoff(sampleSuccessResult, {
        dishName: 'Heirloom Tomato Salad',
        currency: '$',
      });
      expect(handoff.candidates[0]?.price_currency).toBeUndefined();
    });

    it('does NOT extract heuristic prices from passage text into candidates', () => {
      const handoff = prepareS3Vis01Handoff(sampleSuccessResult, {
        dishName: 'Heirloom Tomato Salad',
        currency: 'USD',
      });
      // The passage has '$16.50', but we strictly leave candidate price_amount undefined
      expect(handoff.candidates[0]?.price_amount).toBeUndefined();
    });
  });

  describe('Requirement 5: Failure handling and schema boundaries', () => {
    it('prevents candidate fabrication when retrieval status is no_result', () => {
      const noResult: BoundedRetrievalResult = {
        schema_version: 1,
        status: 'no_result',
        passages: [],
        warnings: ['No matching dishes found'],
      };

      const handoff = prepareS3Vis01Handoff(noResult, { dishName: 'Caviar' });
      expect(handoff.readyForIngestion).toBe(false);
      expect(handoff.candidates).toHaveLength(0);
      expect(handoff.decoupledEvidence).toHaveLength(0);
    });

    it('prevents candidate fabrication when retrieval status is failed', () => {
      const failedResult: BoundedRetrievalResult = {
        schema_version: 1,
        status: 'failed',
        passages: [],
        warnings: ['All candidate sources unreachable'],
      };

      const handoff = prepareS3Vis01Handoff(failedResult, { dishName: 'Duck' });
      expect(handoff.readyForIngestion).toBe(false);
      expect(handoff.candidates).toHaveLength(0);
    });

    it('handles ambiguous retrieval by adding explicit review warnings for staff', () => {
      const ambiguousResult: BoundedRetrievalResult = {
        schema_version: 1,
        status: 'ambiguous',
        passages: [
          {
            passage_id: 'pass_1',
            source: { source_id: 'src_1', segment_id: 'seg_1' },
            text: 'Seafood Chowder Bowl: $12.00',
            start_offset: 0,
            end_offset: 28,
            rank: 1,
            score: 0.88,
          },
        ],
        warnings: ['Conflicting price points detected'],
      };

      const handoff = prepareS3Vis01Handoff(ambiguousResult, {
        dishName: 'Seafood Chowder',
      });

      expect(handoff.readyForIngestion).toBe(true);
      expect(handoff.retrievalStatus).toBe('ambiguous');
      expect(
        handoff.unresolvedWarnings.some((w) =>
          w.includes('human review must confirm correct dish formulation'),
        ),
      ).toBe(true);
    });

    it('rejects malformed retrieval payloads with strict schema error', () => {
      const invalidResult = {
        status: 'success',
        passages: [{ invalid_field: true }],
      };

      expect(() => prepareS3Vis01Handoff(invalidResult, { dishName: 'Tacos' })).toThrow();
    });
  });
});
