import Navigo from "navigo";
import { mount as mountLogin } from "./login/main.js";
import { mount as mountCustomers } from "./customers/main.js";
import {
  mountProductListPage,
  mountProductFormPage,
} from "./products/product.js";
import { mount as mountHome } from "./home/home.js";
import { mountOrderListPage } from "./orders/orders.js";
import { mountOrderFormPage } from "./orders/order-form.js";
import { mountOrderDetailsPage } from "./orders/order-details.js";
import { mount as mountReports } from "./reports/report.js";

export const router = new Navigo("/", { hash: true });

const app = document.getElementById("app");

router
  .on("/home", () => mountHome(app))
  .on("/login", () => mountLogin(app))
  .on("/customers", () => mountCustomers(app))
  .on("/products", () => mountProductListPage(app))
  .on("/products/create", () => mountProductFormPage(app))
  .on("/orders", () => mountOrderListPage(app))
  .on("/orders/create", () => mountOrderFormPage(app))
  .on("/orders/edit/:id", ({ data }) => mountOrderFormPage(app, data.id))
  .on("/orders/:id", ({ data }) => mountOrderDetailsPage(app, data.id))
  .on("/reports", () => mountReports(app))
  .notFound(() => router.navigate("/login"));

router.resolve();
