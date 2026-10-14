import assert from 'node:assert/strict';
import test from 'node:test';
import { ensureSuccess, validateTap } from './test-db.mjs';

test('ensureSuccess rejects failed command exits', () => {
  assert.throws(() => ensureSuccess({ status: 1 }, 'migration'), /migration: exited 1/);
  assert.throws(
    () => ensureSuccess({ status: null, error: new Error('timeout') }, 'pgTAP'),
    /pgTAP: timeout/,
  );
});

test('failed database commands retain bounded stderr needed to diagnose SQL errors', () => {
  assert.throws(
    () => ensureSuccess({ status: 3, stderr: 'ERROR: column does not exist' }, 'pgTAP'),
    /pgTAP: exited 3.*column does not exist/s,
  );
  assert.throws(
    () => ensureSuccess({ status: 1, stderr: 'x'.repeat(3000) }, 'docker'),
    (error) => error.message.length < 2100,
  );
});

test('validateTap accepts a complete passing plan', () => {
  assert.equal(validateTap('1..2\nok 1 - first\nok 2 - second\n'), 2);
});

test('validateTap fails closed for invalid TAP', () => {
  for (const output of [
    ' ok 1 - first\n',
    '1..2\nok 1 - first\n',
    '1..1\n not ok 1 - failed\n',
    '1..1\nBail out! abort\n',
    '1..1\nok 1 - first\nBail out! abort after assertion\n',
  ]) {
    assert.throws(() => validateTap(output));
  }
});
