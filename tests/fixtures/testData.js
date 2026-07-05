/**
 * Dữ liệu test cho ShopAdmin
 * Thay đổi credentials thật nếu muốn test E2E với API thật
 */
const TEST_DATA = {
  validUser: {
    email: 'admin@shopadmin.com',
    password: 'Admin@123',
  },
  invalidUser: {
    email: 'wrong@email.com',
    password: 'wrongpassword',
  },
  weakPassword: {
    email: 'test@test.com',
    password: '123',
  },
  invalidEmail: {
    email: 'not-an-email',
    password: 'ValidPass123',
  },
};

const ROUTES = {
  login:     '/#/login',
  customers: '/#/customers',
  products:  '/app/products/index.html',
  reports:   '/app/reports/index.html',
};

const API_BASE = 'https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com';

module.exports = { TEST_DATA, ROUTES, API_BASE };
