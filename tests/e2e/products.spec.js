// @ts-check
const { test, expect } = require('@playwright/test');
const { ROUTES, API_BASE } = require('../fixtures/testData');

const PRODUCTS_URL = 'http://localhost:5173/app/products/index.html';

// Mock data sản phẩm
const mockProducts = [
  { id: 1, name: 'Áo thun nam', sku: 'AT001', price: 150000, remaining: 50, category: { id: 1, name: 'Thời trang' } },
  { id: 2, name: 'Quần jeans',  sku: 'QJ001', price: 350000, remaining: 8,  category: { id: 1, name: 'Thời trang' } },
  { id: 3, name: 'Giày thể thao', sku: 'GT001', price: 500000, remaining: 20, category: { id: 2, name: 'Giày dép' } },
];

const mockCategories = [
  { id: 1, name: 'Thời trang' },
  { id: 2, name: 'Giày dép' },
];

// Helper: set token + mock API
async function setupProductsPage(page) {
  // Inject token trước navigate
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
    localStorage.setItem('refreshToken', 'mock-refresh-token');
  });

  await page.route('**/products', async (r) => {
    await r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockProducts),
    });
  });

  await page.route('**/categories', async (r) => {
    await r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockCategories),
    });
  });

  await page.route('**/auth/**', async (r) => {
    await r.fulfill({ status: 401, body: 'Unauthorized' });
  });

  await page.goto(PRODUCTS_URL);
}

test.describe('Products Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCTS_URL);
    await page.evaluate(() => localStorage.clear());
  });

  // ─── TC01: Trang products có title đúng ────────────────────────────────────────
  test('TC01 - Title trang là "Quản Lý Sản Phẩm | ShopAdmin"', async ({ page }) => {
    await setupProductsPage(page);
    await expect(page).toHaveTitle(/Quản Lý Sản Phẩm/);
  });

  // ─── TC02: Hiển thị layout sidebar và main ────────────────────────────────
  test('TC02 - Hiển thị sidebar và main content', async ({ page }) => {
    await setupProductsPage(page);

    await expect(page.locator('.sidebar')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.main-content')).toBeVisible();
    await expect(page.locator('h2:has-text("ShopAdmin")')).toBeVisible();
  });

  // ─── TC03: Hiển thị tiêu đề trang ────────────────────────────────────────
  test('TC03 - Title trang là "Quản Lý Sản Phẩm"', async ({ page }) => {
    await setupProductsPage(page);
    await expect(page).toHaveTitle(/Quản Lý Sản Phẩm/);
  });

  // ─── TC04: Hiển thị danh sách sản phẩm ───────────────────────────────────
  test('TC04 - Hiển thị đúng số sản phẩm trong bảng', async ({ page }) => {
    await setupProductsPage(page);

    const rows = page.locator('#productTableBody tr');
    await expect(rows).toHaveCount(3, { timeout: 10000 });
  });

  // ─── TC05: Hiển thị tên sản phẩm ─────────────────────────────────────────
  test('TC05 - Hiển thị đúng tên sản phẩm', async ({ page }) => {
    await setupProductsPage(page);

    await expect(page.locator('#productTableBody')).toContainText('Áo thun nam', { timeout: 10000 });
    await expect(page.locator('#productTableBody')).toContainText('Quần jeans');
    await expect(page.locator('#productTableBody')).toContainText('Giày thể thao');
  });

  // ─── TC06: Stats cards cập nhật đúng ─────────────────────────────────────
  test('TC06 - Stats cards hiển thị đúng số lượng', async ({ page }) => {
    await setupProductsPage(page);

    await expect(page.locator('#totalProducts')).toHaveText('3', { timeout: 10000 });
    await expect(page.locator('#totalCategories')).toHaveText('2');
  });

  // ─── TC07: Sản phẩm sắp hết hàng (remaining <= 10) ───────────────────────
  test('TC07 - Sản phẩm sắp hết hàng hiển thị badge cảnh báo', async ({ page }) => {
    await setupProductsPage(page);

    await page.locator('#productTableBody tr').first().waitFor({ timeout: 10000 });

    // Quần jeans có remaining = 8 → badge warning
    const warningBadge = page.locator('.badge-warning').first();
    await expect(warningBadge).toBeVisible();
    await expect(warningBadge).toContainText('Cảnh báo');

    // lowStock counter
    await expect(page.locator('#lowStockProducts')).toHaveText('1');
  });

  // ─── TC08: Tìm kiếm sản phẩm ─────────────────────────────────────────────
  test('TC08 - Tìm kiếm lọc đúng sản phẩm theo tên', async ({ page }) => {
    await setupProductsPage(page);

    await page.locator('#productTableBody tr').first().waitFor({ timeout: 10000 });

    await page.locator('#searchInput').fill('Áo thun');
    await page.locator('#searchInput').dispatchEvent('input');

    const rows = page.locator('#productTableBody tr');
    await expect(rows).toHaveCount(1, { timeout: 5000 });
    await expect(rows.first()).toContainText('Áo thun nam');
  });

  // ─── TC09: Lọc theo danh mục ─────────────────────────────────────────────
  test('TC09 - Bộ lọc danh mục hoạt động đúng', async ({ page }) => {
    await setupProductsPage(page);

    await page.locator('#productTableBody tr').first().waitFor({ timeout: 10000 });

    // Chọn danh mục "Giày dép" (id=2)
    await page.locator('#categoryFilter').selectOption('2');

    const rows = page.locator('#productTableBody tr');
    await expect(rows).toHaveCount(1, { timeout: 5000 });
    await expect(rows.first()).toContainText('Giày thể thao');
  });

  // ─── TC10: Nút delete mở confirm modal ───────────────────────────────────
  test('TC10 - Click xóa mở modal xác nhận', async ({ page }) => {
    await setupProductsPage(page);

    await page.locator('#productTableBody tr').first().waitFor({ timeout: 10000 });

    // Click nút xoá đầu tiên
    await page.locator('[data-delete-id]').first().click();

    const deleteModal = page.locator('#deleteProductModal');
    await expect(deleteModal).toBeVisible({ timeout: 5000 });
    await expect(deleteModal).toContainText('Áo thun nam');
  });

  // ─── TC11: Cancel trong delete modal đóng modal ──────────────────────────
  test('TC11 - Cancel trong modal xóa đóng modal', async ({ page }) => {
    await setupProductsPage(page);

    await page.locator('#productTableBody tr').first().waitFor({ timeout: 10000 });

    await page.locator('[data-delete-id]').first().click();
    await expect(page.locator('#deleteProductModal')).toBeVisible({ timeout: 5000 });

    await page.locator('#cancelDeleteBtn').click();
    await expect(page.locator('#deleteProductModal')).toBeHidden();
  });

  // ─── TC12: Nút thêm sản phẩm điều hướng tới create.html ─────────────────
  test('TC12 - Click thêm sản phẩm chuyển đến trang tạo mới', async ({ page }) => {
    await setupProductsPage(page);

    await expect(page.locator('a.btn-add[href*="create.html"]')).toBeVisible({ timeout: 8000 });

    const [newPage] = await Promise.all([
      page.waitForURL(/create\.html/, { timeout: 8000 }).catch(() => null),
      page.locator('a.btn-add[href*="create.html"]').click(),
    ]);

    await expect(page).toHaveURL(/create\.html/);
  });
});
