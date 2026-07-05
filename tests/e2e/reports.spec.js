// @ts-check
const { test, expect } = require('@playwright/test');
const { API_BASE } = require('../fixtures/testData');

const REPORTS_URL = 'http://localhost:5173/app/reports/index.html';

// Mock data báo cáo
const mockOrders = [
  { id: 1, createdAt: new Date().toISOString(), amount: 2, product: { id: 1, price: 150000, categoryId: 1 }, customer: { id: 1 } },
  { id: 2, createdAt: new Date().toISOString(), amount: 1, product: { id: 2, price: 350000, categoryId: 1 }, customer: { id: 2 } },
  { id: 3, createdAt: new Date().toISOString(), amount: 3, product: { id: 3, price: 200000, categoryId: 2 }, customer: { id: 1 } },
];

const mockProducts = [
  { id: 1, name: 'Áo thun nam',    price: 150000, remaining: 50, categoryId: 1 },
  { id: 2, name: 'Quần jeans',     price: 350000, remaining: 8,  categoryId: 1 },
  { id: 3, name: 'Giày thể thao',  price: 200000, remaining: 2,  categoryId: 2 },
];

const mockCategories = [
  { id: 1, name: 'Thời trang' },
  { id: 2, name: 'Giày dép' },
];

// Helper: set token + mock APIs + load page
async function setupReportsPage(page) {
  // Set token trước khi navigate để authGuard() thấy khi DOMContentLoaded
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
    localStorage.setItem('refreshToken', 'mock-refresh-token');
  });

  await page.route('**/products', async (r) => {
    await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProducts) });
  });
  await page.route('**/orders', async (r) => {
    await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockOrders) });
  });
  await page.route('**/categories', async (r) => {
    await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCategories) });
  });
  await page.route('**/auth/**', async (r) => {
    await r.fulfill({ status: 401, body: 'Unauthorized' });
  });

  await page.goto(REPORTS_URL);
}

test.describe('Reports Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(REPORTS_URL);
    await page.evaluate(() => localStorage.clear());
  });

  // ─── TC01: AuthGuard - chưa login → redirect ──────────────────────────────
  test('TC01 - Chưa đăng nhập → redirect về login', async ({ page }) => {
    await page.goto(REPORTS_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page).toHaveURL(/login/, { timeout: 8000 });
  });

  // ─── TC02: Tiêu đề trang ──────────────────────────────────────────────────
  test('TC02 - Title trang là "Báo Cáo Doanh Thu"', async ({ page }) => {
    await setupReportsPage(page);
    await expect(page).toHaveTitle(/Báo Cáo Doanh Thu/);
  });

  // ─── TC03: Hiển thị layout ────────────────────────────────────────────────
  test('TC03 - Hiển thị sidebar và header', async ({ page }) => {
    await setupReportsPage(page);

    await expect(page.locator('.sidebar')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('h2:has-text("Báo cáo kinh doanh")')).toBeVisible();
  });

  // ─── TC04: Hiển thị 4 stat cards ─────────────────────────────────────────
  test('TC04 - Hiển thị 4 stat cards (doanh thu, đơn, sắp hết, danh mục)', async ({ page }) => {
    await setupReportsPage(page);

    const statCards = page.locator('.stat-card');
    await expect(statCards).toHaveCount(4, { timeout: 10000 });
  });

  // ─── TC05: Stats card doanh thu hiển thị ─────────────────────────────────
  test('TC05 - Stat card Doanh thu có giá trị sau khi tải', async ({ page }) => {
    await setupReportsPage(page);

    const revenueCard = page.locator('#totalRevenue');
    await expect(revenueCard).toBeVisible({ timeout: 10000 });
    // Giá trị không còn là '0đ'
    await expect(revenueCard).not.toHaveText('0đ', { timeout: 10000 });
  });

  // ─── TC06: Stat card Đơn hàng ─────────────────────────────────────────────
  test('TC06 - Stat card Đơn hàng hiển thị đúng số đơn', async ({ page }) => {
    await setupReportsPage(page);

    const ordersEl = page.locator('#totalOrders');
    await expect(ordersEl).toHaveText('3', { timeout: 10000 });
  });

  // ─── TC07: Stat card Sắp hết hàng ────────────────────────────────────────
  test('TC07 - Stat card Sắp hết hàng đếm đúng sản phẩm', async ({ page }) => {
    await setupReportsPage(page);

    const lowStockEl = page.locator('#lowStockProducts');
    // 2 sản phẩm có remaining <= 10 (Quần jeans=8, Giày thể thao=2)
    await expect(lowStockEl).toHaveText('2', { timeout: 10000 });
  });

  // ─── TC08: Biểu đồ doanh thu render ──────────────────────────────────────
  test('TC08 - Canvas biểu đồ doanh thu được render', async ({ page }) => {
    await setupReportsPage(page);

    const revenueChart = page.locator('#revenueChart');
    await expect(revenueChart).toBeVisible({ timeout: 10000 });
  });

  // ─── TC09: Biểu đồ danh mục render ───────────────────────────────────────
  test('TC09 - Canvas biểu đồ cơ cấu sản phẩm được render', async ({ page }) => {
    await setupReportsPage(page);

    const categoryChart = page.locator('#categoryChart');
    await expect(categoryChart).toBeVisible({ timeout: 10000 });
  });

  // ─── TC10: Bảng sản phẩm bán chạy ────────────────────────────────────────
  test('TC10 - Bảng top sản phẩm bán chạy hiển thị sau tải', async ({ page }) => {
    await setupReportsPage(page);

    const topProductsBody = page.locator('#topProductsBody');
    await expect(topProductsBody).toBeVisible({ timeout: 10000 });

    const rows = topProductsBody.locator('tr');
    await expect(rows).toHaveCount(3, { timeout: 10000 });
  });

  // ─── TC11: Bộ lọc ngày tháng ─────────────────────────────────────────────
  test('TC11 - Bộ lọc ngày from/to được hiển thị và có giá trị mặc định', async ({ page }) => {
    await setupReportsPage(page);

    const fromDate = page.locator('#fromDate');
    const toDate = page.locator('#toDate');

    await expect(fromDate).toBeVisible({ timeout: 8000 });
    await expect(toDate).toBeVisible();

    // Có giá trị ngày mặc định (không rỗng)
    const fromVal = await fromDate.inputValue();
    const toVal = await toDate.inputValue();
    expect(fromVal).not.toBe('');
    expect(toVal).not.toBe('');
  });

  // ─── TC12: Nút đăng xuất ─────────────────────────────────────────────────
  test('TC12 - Nút đăng xuất xóa token và redirect', async ({ page }) => {
    // Setup routes trước khi navigate
    await page.route('**/products', async (r) => {
      await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProducts) });
    });
    await page.route('**/orders', async (r) => {
      await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockOrders) });
    });
    await page.route('**/categories', async (r) => {
      await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCategories) });
    });
    await page.route('**/auth/**', async (r) => {
      await r.fulfill({ status: 401, body: 'Unauthorized' });
    });

    // Dùng addInitScript để token được inject khi reload (DOMContentLoaded)
    // Chỉ inject khi không phải ở trang login để tránh tự động login lại sau khi click logout
    await page.addInitScript(() => {
      if (!window.location.href.includes('login')) {
        localStorage.setItem('accessToken', 'mock-access-token');
        localStorage.setItem('refreshToken', 'mock-refresh-token');
      }
    });

    await page.goto(REPORTS_URL);

    await expect(page.locator('#logoutBtn')).toBeVisible({ timeout: 8000 });

    // Xóa addInitScript effect bằng cách unroute sau khi page đã load
    // Rồi click logout
    await page.locator('#logoutBtn').click();

    // Đợi redirect về login
    await expect(page).toHaveURL(/login/, { timeout: 8000 });

    // Verify bằng cách check token trong localStorage đã thực sự bị xóa
    const token = await page.evaluate(() => localStorage.getItem('refreshToken'));
    expect(token).toBeNull();
  });
});
