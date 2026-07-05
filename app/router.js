import Navigo from "navigo";
import { mount as mountLogin } from "./login/main.js";
import { mount as mountCustomers } from "./customers/main.js";
import {
  mountProductListPage,
  mountProductFormPage,
} from "./products/product.js";

export const router = new Navigo("/", { hash: true });

const app = document.getElementById("app");

function mountPlaceholderPage(title, description) {
  app.innerHTML = `
    <div style="min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f4f7f6;">
      <div style="max-width: 640px; width: 100%; background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
        <h1 style="margin: 0 0 12px; color: #2c3e50;">${title}</h1>
        <p style="margin: 0 0 24px; color: #7f8c8d; line-height: 1.6;">${description}</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="#/products" style="padding: 12px 18px; border-radius: 10px; background: #3498db; color: #fff; text-decoration: none;">Sản phẩm</a>
          <a href="#/customers" style="padding: 12px 18px; border-radius: 10px; background: #2c3e50; color: #fff; text-decoration: none;">Khách hàng</a>
        </div>
      </div>
    </div>
  `;
}

router
  .on("/home", () =>
    mountPlaceholderPage(
      "Tổng quan",
      "Trang tổng quan đang được hoàn thiện. Bạn có thể chuyển qua Sản phẩm hoặc Khách hàng bằng menu bên trái.",
    ),
  )
  .on("/login", () => mountLogin(app))
  .on("/customers", () => mountCustomers(app))
  .on("/products", () => mountProductListPage(app))
  .on("/products/create", () => mountProductFormPage(app))
  .on("/orders", () =>
    mountPlaceholderPage(
      "Đơn hàng",
      "Trang Đơn hàng chưa được triển khai. Menu vẫn hoạt động để không bị kẹt ở trang products.",
    ),
  )
  .on("/reports", () =>
    mountPlaceholderPage(
      "Báo cáo",
      "Trang Báo cáo chưa được triển khai. Hiện tại chỉ có Sản phẩm và Khách hàng là đầy đủ.",
    ),
  )
  .notFound(() => router.navigate("/login"));

router.resolve();
