import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('diner message stays readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('See the dish.');
    await expect(
      page.getByText('No restaurant menu is published here yet.', { exact: false }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});

for (const port of [5173, 5174]) {
  test(`shell ${port} is accessible and fits a narrow viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto(`http://127.0.0.1:${port}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      violations.map(({ id, impact, nodes }) => ({
        id,
        impact,
        targets: nodes.map((node) => node.target),
      })),
    ).toEqual([]);
  });
}

test('staff shell is honest and Worker serves only its health contract', async ({
  page,
  request,
}) => {
  await page.goto('http://127.0.0.1:5174');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('trusted content');
  await expect(
    page.getByText('Authentication, review and publication are not enabled yet.', { exact: false }),
  ).toBeVisible();
  const health = await request.get('http://127.0.0.1:8787/health');
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({
    status: 'ok',
    service: 'peekaplate-api',
    stage: 'foundation',
  });
  expect((await request.post('http://127.0.0.1:8787/events', { data: {} })).status()).toBe(404);
});
