import Navigo from "navigo";
import { mount as mountLogin } from "./login/main.js";
import { mount as mountCustomers } from "./customers/main.js";

export const router = new Navigo("/", { hash: true });

const app = document.getElementById("app");

router
    .on("/login", () => mountLogin(app))
    .on("/customers", () => mountCustomers(app))
    .notFound(() => router.navigate("/login"));

router.resolve();
