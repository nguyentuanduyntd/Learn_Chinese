import { expect, test } from '@playwright/test';

test('cài đặt giao diện lưu IndexedDB, reload vẫn giữ', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/#/dev/gallery');
  await page.getByRole('button', { name: 'Tối' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Tối' })).toHaveAttribute('aria-pressed', 'true');

  // Trả về theo hệ thống để không ảnh hưởng test khác dùng cùng origin.
  await page.getByRole('button', { name: 'Theo hệ thống' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
