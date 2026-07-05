import Navigo from "navigo";
import { mount as mountLogin } from "./login/main.js";
import { mount as mountCustomers } from "./customers/main.js";
import {
  mountProductListPage,
  mountProductFormPage,
} from "./products/product.js";

export const router = new Navigo("/", { hash: true });

const app = document.getElementById("app");

router
  .on("/home", () => router.navigate("/products"))
  .on("/login", () => mountLogin(app))
  .on("/customers", () => mountCustomers(app))
  .on("/products", () => mountProductListPage(app))
  .on("/products/create", () => mountProductFormPage(app))
  .on("/orders", () => router.navigate("/products"))
  .on("/reports", () => router.navigate("/products"))
  .notFound(() => router.navigate("/products"));

router.resolve();
