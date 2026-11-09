import { expect, test } from '@playwright/test';

test('chuyển 4 tab, mỗi tab có tiêu đề riêng', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Điều hướng chính' });
  for (const [label, hash] of [
    ['Ôn tập', '#/review'],
    ['Sổ Tay', '#/notebook'],
    ['Tôi', '#/profile'],
    ['Học', '#/'],
  ]) {
    await nav.getByRole('link', { name: label }).click();
    await expect(page).toHaveURL(new RegExp(`${hash}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(label);
  }
});

test('dark mode: data-theme theo hệ thống, nền tối', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(23, 19, 15)');
});

test('Pinyin "nǐ hǎo" trong gallery hiện màu thanh 3 (xanh lá)', async ({ page }) => {
  await page.goto('/#/dev/gallery');
  const syllable = page.locator('[data-tone="3"]', { hasText: 'Nǐ' }).first();
  await expect(syllable).toHaveCSS('color', 'rgb(42, 157, 143)');
});
