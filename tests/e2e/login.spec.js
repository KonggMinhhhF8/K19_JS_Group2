// @ts-check
const { test, expect } = require('@playwright/test');
const { TEST_DATA, ROUTES, API_BASE } = require('../fixtures/testData');

test.describe('Login Page', () => {

  test.beforeEach(async ({ page }) => {
    // Xoá localStorage trước mỗi test
    await page.goto(ROUTES.login);
    await page.evaluate(() => localStorage.clear());
    await page.goto(ROUTES.login);
  });

  // ─── TC01: Hiển thị form đăng nhập ────────────────────────────────────────
  test('TC01 - Hiển thị đầy đủ các phần tử form', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('#togglePass')).toBeVisible();
  });

  // ─── TC02: Validate email rỗng ─────────────────────────────────────────────
  test('TC02 - Validate: email rỗng hiển thị lỗi', async ({ page }) => {
    await page.locator('#password').fill('ValidPass123');
    await page.locator('button[type="submit"]').click();

    const emailField = page.locator('#emailField');
    await expect(emailField).toHaveClass(/invalid/);
    await expect(emailField.locator('.error')).toBeVisible();
  });

  // ─── TC03: Validate email sai format ──────────────────────────────────────
  test('TC03 - Validate: email sai format hiển thị lỗi', async ({ page }) => {
    await page.locator('#email').fill(TEST_DATA.invalidEmail.email);
    await page.locator('#password').fill('ValidPass123');
    await page.locator('button[type="submit"]').click();

    const emailField = page.locator('#emailField');
    await expect(emailField).toHaveClass(/invalid/);
  });

  // ─── TC04: Validate password quá ngắn ─────────────────────────────────────
  test('TC04 - Validate: password < 6 ký tự hiển thị lỗi', async ({ page }) => {
    await page.locator('#email').fill(TEST_DATA.validUser.email);
    await page.locator('#password').fill(TEST_DATA.weakPassword.password);
    await page.locator('button[type="submit"]').click();

    const passField = page.locator('#passField');
    await expect(passField).toHaveClass(/invalid/);
    await expect(passField.locator('.error')).toBeVisible();
  });

  // ─── TC05: Toggle hiện/ẩn mật khẩu ───────────────────────────────────────
  test('TC05 - Toggle: click icon mắt đổi type input password', async ({ page }) => {
    const passwordInput = page.locator('#password');
    const toggleBtn = page.locator('#togglePass');

    await expect(passwordInput).toHaveAttribute('type', 'password');

    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // ─── TC06: Lỗi khi nhập credentials sai (mock API) ────────────────────────
  test('TC06 - Đăng nhập sai credentials hiển thị lỗi', async ({ page, context }) => {
    // context.route áp dụng trước và sau cả beforeEach navigate
    await context.route(/auth\/signin/, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    });

    await page.locator('#email').fill(TEST_DATA.invalidUser.email);
    await page.locator('#password').fill(TEST_DATA.invalidUser.password);
    await page.locator('button[type="submit"]').click();

    const loginError = page.locator('#loginError');
    await expect(loginError).toBeVisible({ timeout: 10000 });
    await expect(loginError).toContainText('không chính xác');
  });

  // ─── TC07: Đăng nhập thành công (mock API) ────────────────────────────────
  test('TC07 - Đăng nhập thành công redirect sang customers', async ({ page }) => {
    // Mock API login
    await page.route('**/auth/signin', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'mock-access-token-abc',
          refreshToken: 'mock-refresh-token-xyz',
        }),
      });
    });

    // Mock customers + orders API sau khi redirect
    await page.route('**/customers', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
    await page.route('**/orders', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.locator('#email').fill(TEST_DATA.validUser.email);
    await page.locator('#password').fill(TEST_DATA.validUser.password);
    await page.locator('button[type="submit"]').click();

    // Sau khi login, router điều hướng sang /#/customers
    await expect(page).toHaveURL(/#\/customers/, { timeout: 8000 });

    // Token phải được lưu vào localStorage
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(accessToken).toBe('mock-access-token-abc');
  });

  // ─── TC08: Xoá lỗi khi người dùng bắt đầu nhập lại ──────────────────────
  test('TC08 - Xoá lỗi validate khi nhập lại', async ({ page }) => {
    // Trigger lỗi
    await page.locator('button[type="submit"]').click();
    const emailField = page.locator('#emailField');
    await expect(emailField).toHaveClass(/invalid/);

    // Nhập lại → lỗi biến mất
    await page.locator('#email').fill('valid@email.com');
    await expect(emailField).not.toHaveClass(/invalid/);
  });

  // ─── TC09: Đã đăng nhập sẵn → redirect thẳng vào app ─────────────────────
  test('TC09 - Đã có refreshToken → redirect khỏi login', async ({ page }) => {
    // Mock customers + orders API
    await page.route('**/customers', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/orders', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    // beforeEach đã navigate và clear token. Set token ngay sau clear rồi reload trang
    await page.evaluate(() => localStorage.setItem('refreshToken', 'existing-token'));
    await page.reload();

    await expect(page).toHaveURL(/#\/customers/, { timeout: 8000 });
  });
});
