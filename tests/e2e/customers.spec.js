// @ts-check
const { test, expect } = require('@playwright/test');
const { ROUTES, API_BASE } = require('../fixtures/testData');

// Helper: mock auth + set localStorage token
async function mockAuthAndVisit(page, route) {
  // Inject token trước navigate để authGuard thấy ngay
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
    localStorage.setItem('refreshToken', 'mock-refresh-token');
  });

  await page.route('**/customers', async (r) => {
    await r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Nguyễn Văn A', email: 'vana@email.com', phone: '0901234567', rank: 'GOLD' },
        { id: 2, name: 'Trần Thị B',   email: 'thib@email.com', phone: '0912345678', rank: 'SILVER' },
        { id: 3, name: 'Lê Văn C',     email: 'vanc@email.com', phone: '0923456789', rank: 'BRONZE' },
      ]),
    });
  });

  await page.route('**/orders', async (r) => {
    await r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, customer: { id: 1 }, amount: 2, product: { price: 150000 } },
        { id: 2, customer: { id: 2 }, amount: 1, product: { price: 200000 } },
      ]),
    });
  });

  await page.route('**/auth/**', async (r) => {
    await r.fulfill({ status: 401, body: 'Unauthorized' });
  });

  await page.goto(route);
}

test.describe('Customers Page', () => {

  // ─── TC01: AuthGuard - chưa login → redirect ──────────────────────────────
  test('TC01 - Chưa đăng nhập → redirect về login', async ({ page }) => {
    await page.goto(ROUTES.customers);
    await page.evaluate(() => localStorage.clear());
    await page.goto(ROUTES.customers);

    await expect(page).toHaveURL(/#\/login/, { timeout: 8000 });
  });

  // ─── TC02: Hiển thị layout trang customers ────────────────────────────────
  test('TC02 - Hiển thị đầy đủ layout sidebar và main content', async ({ page }) => {
    await mockAuthAndVisit(page, ROUTES.customers);

    await expect(page.locator('.sidebar')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.main-content')).toBeVisible();
    await expect(page.locator('h2:has-text("ShopAdmin")')).toBeVisible();
  });

  // ─── TC03: Hiển thị danh sách khách hàng ─────────────────────────────────
  test('TC03 - Hiển thị danh sách khách hàng trong bảng', async ({ page }) => {
    await mockAuthAndVisit(page, ROUTES.customers);

    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(3, { timeout: 10000 });
  });

  // ─── TC04: Hiển thị thông tin khách hàng ─────────────────────────────────
  test('TC04 - Hiển thị đúng tên khách hàng trong bảng', async ({ page }) => {
    await mockAuthAndVisit(page, ROUTES.customers);

    await expect(page.locator('tbody')).toContainText('Nguyễn Văn A', { timeout: 10000 });
    await expect(page.locator('tbody')).toContainText('Trần Thị B');
  });

  // ─── TC05: Hiển thị stats cards ───────────────────────────────────────────
  test('TC05 - Hiển thị stat cards tổng khách hàng', async ({ page }) => {
    await mockAuthAndVisit(page, ROUTES.customers);

    const statsSection = page.locator('#statsSection');
    await expect(statsSection).toBeVisible({ timeout: 10000 });

    const statCards = statsSection.locator('.card');
    await expect(statCards).toHaveCount(3);
  });

  // ─── TC06: Tìm kiếm khách hàng ────────────────────────────────────────────
  test('TC06 - Tìm kiếm lọc đúng khách hàng theo tên', async ({ page }) => {
    await mockAuthAndVisit(page, ROUTES.customers);

    await page.locator('tbody tr').first().waitFor({ timeout: 10000 });

    await page.locator('#search').fill('Nguyễn Văn A');
    await page.locator('#search').press('Enter');

    // Chỉ hiện row khớp
    const visibleRows = page.locator('tbody tr:visible');
    await expect(visibleRows).toHaveCount(1);
    await expect(visibleRows.first()).toContainText('Nguyễn Văn A');
  });

  // ─── TC07: Lọc theo hạng (tier) ───────────────────────────────────────────
  test('TC07 - Bộ lọc hạng chỉ hiện khách hàng đúng hạng', async ({ page }) => {
    await mockAuthAndVisit(page, ROUTES.customers);

    await page.locator('tbody tr').first().waitFor({ timeout: 10000 });

    await page.locator('#tierFilter').selectOption('silver');

    const visibleRows = page.locator('tbody tr:visible');
    await expect(visibleRows).toHaveCount(1);
    await expect(visibleRows.first()).toContainText('Trần Thị B');
  });

  // ─── TC08: Nút thêm khách hàng mở modal ──────────────────────────────────
  test('TC08 - Click nút thêm khách hàng mở modal', async ({ page }) => {
    await mockAuthAndVisit(page, ROUTES.customers);

    await expect(page.locator('#addCustomerBtn')).toBeVisible({ timeout: 8000 });
    await page.locator('#addCustomerBtn').click();

    // Modal xuất hiện — tìm theo nhiều selector khác nhau
    const modal = page.locator([
      '.modal[style*="flex"]',
      '.modal[style*="block"]',
      '[class*="modal-overlay"]',
      '[class*="modal-container"]',
      'dialog[open]',
      '[role="dialog"]',
    ].join(', '));
    await expect(modal.or(page.locator('input[placeholder*="tên"], input[placeholder*="email"]').first())).toBeVisible({ timeout: 8000 });
  });

  // ─── TC09: Nút đăng xuất xoá token và redirect ────────────────────────────
  test('TC09 - Đăng xuất xoá localStorage và redirect về login', async ({ page }) => {
    await mockAuthAndVisit(page, ROUTES.customers);

    await expect(page.locator('#logoutBtn')).toBeVisible({ timeout: 8000 });
    await page.locator('#logoutBtn').click();

    await expect(page).toHaveURL(/#\/login/, { timeout: 8000 });

    const token = await page.evaluate(() => localStorage.getItem('refreshToken'));
    expect(token).toBeNull();
  });
});
