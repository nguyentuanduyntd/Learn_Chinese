import { expect, test } from '@playwright/test';

test('mở app: đúng tiêu đề, font tự host tải được', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Nǐ Hǎo Mỗi Ngày');
  // fonts.load tải thật file font (lỗi mạng → reject) và trả về các FontFace khớp.
  const loaded = await page.evaluate(async () => ({
    vi: (await document.fonts.load('16px "Be Vietnam Pro"', 'Xin chào')).length,
    han: (await document.fonts.load('16px "Noto Sans SC"', '你好')).length,
  }));
  expect(loaded.vi).toBeGreaterThan(0);
  expect(loaded.han).toBeGreaterThan(0);
});
