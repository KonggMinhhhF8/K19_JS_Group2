import httpRequest from "../../utils/httpRequest.js";
import { renderSidebarHTML, initSidebar } from "../shared/sidebar.js";
import { router } from "../router.js";
import "./orders.css";

let productsList = [];

function getOrderFormHTML(isEditMode) {
    return `
    <div class="orders-page">
        <div class="overlay" id="overlay"></div>
        <div class="container">
            ${renderSidebarHTML("orders")}
            <main class="main-content">
                <header>
                    <button class="menu-btn" id="menuToggle"><i class="fas fa-bars"></i></button>
                    <h1 id="page-title">${isEditMode ? "Cập Nhật Đơn Hàng" : "Tạo Đơn Hàng Mới"}</h1>
                </header>

                <section class="form-container">
                    <form id="orderForm">
                        <div class="form-group">
                            <label for="customerSelect">Khách hàng <span style="color:red">*</span></label>
                            <select id="customerSelect" required>
                                <option value="">-- Chọn khách hàng --</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="productSelect">Sản phẩm <span style="color:red">*</span></label>
                            <select id="productSelect" required>
                                <option value="">-- Chọn sản phẩm --</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="quantity">Số lượng <span style="color:red">*</span></label>
                            <input type="number" id="quantity" min="1" value="1" required>
                        </div>

                        <div class="form-group">
                            <label for="statusSelect">Trạng thái <span style="color:red">*</span></label>
                            <select id="statusSelect" required>
                                <option value="pending">Chờ xử lý</option>
                                <option value="delivering">Đang giao</option>
                                <option value="done">Hoàn thành</option>
                                <option value="cancel">Đã hủy</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="totalPrice">Tổng tiền</label>
                            <input type="text" id="totalPrice" readonly value="0đ">
                        </div>

                        <div class="btn-container">
                            <button type="button" class="btn btn-cancel" id="btnCancel">Hủy</button>
                            <button type="submit" class="btn btn-save" id="btnSubmit">${isEditMode ? "Cập nhật" : "Lưu đơn hàng"}</button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    </div>
    `;
}

async function fetchCustomers(el) {
    try {
        const customers = await httpRequest.get("customers");
        const select = el.querySelector("#customerSelect");
        customers.forEach((c) => {
            const option = document.createElement("option");
            option.value = c.id;
            option.textContent = `${c.name} (${c.phone || c.email})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Lỗi khi tải danh sách khách hàng:", error);
    }
}

async function fetchProducts(el) {
    try {
        productsList = await httpRequest.get("products");
        const select = el.querySelector("#productSelect");
        productsList.forEach((p) => {
            const option = document.createElement("option");
            option.value = p.id;
            option.textContent = `${p.name} - ${p.price.toLocaleString("vi-VN")}đ`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Lỗi khi tải danh sách sản phẩm:", error);
        productsList = [];
    }
}

async function loadOrderData(el, id) {
    try {
        // API doesn't have GET /orders/{id}, so we fetch all and find
        const orders = await httpRequest.get("orders");
        const order = orders.find((o) => o.id == id);

        if (!order) {
            alert("Không tìm thấy đơn hàng!");
            router.navigate("/orders");
            return;
        }

        el.querySelector("#customerSelect").value = order.customer?.id || "";
        el.querySelector("#productSelect").value = order.product?.id || "";
        el.querySelector("#quantity").value = order.amount || 1;
        el.querySelector("#statusSelect").value = order.status || "pending";

        calculateTotal(el);
    } catch (error) {
        console.error("Lỗi khi tải thông tin đơn hàng:", error);
        alert("Không tìm thấy đơn hàng!");
        router.navigate("/orders");
    }
}

function calculateTotal(el) {
    const productId = el.querySelector("#productSelect").value;
    const quantity = parseInt(el.querySelector("#quantity").value) || 1;

    if (!productId) {
        el.querySelector("#totalPrice").value = "0đ";
        return;
    }

    const product = productsList.find((p) => p.id == productId);
    if (product) {
        const total = product.price * quantity;
        el.querySelector("#totalPrice").value = total.toLocaleString("vi-VN") + "đ";
    }
}

async function handleFormSubmit(event, el, isEditMode, orderId) {
    event.preventDefault();

    const payload = {
        customerId: parseInt(el.querySelector("#customerSelect").value),
        productId: parseInt(el.querySelector("#productSelect").value),
        amount: parseInt(el.querySelector("#quantity").value) || 1,
        status: el.querySelector("#statusSelect").value,
    };

    try {
        if (isEditMode) {
            await httpRequest.put(`orders/${orderId}`, payload);
        } else {
            await httpRequest.post("orders", payload);
        }

        alert(isEditMode ? "Cập nhật đơn hàng thành công!" : "Tạo đơn hàng thành công!");
        router.navigate("/orders");
    } catch (error) {
        console.error("Lỗi khi lưu đơn hàng:", error);
        alert("Có lỗi xảy ra, vui lòng thử lại!");
    }
}

export async function mountOrderFormPage(el, id) {
    if (!localStorage.getItem("refreshToken")) {
        localStorage.setItem("redirectAfterLogin", "/orders");
        router.navigate("/login");
        return;
    }

    const isEditMode = Boolean(id);
    el.innerHTML = getOrderFormHTML(isEditMode);
    initSidebar(el, router);

    await Promise.all([fetchCustomers(el), fetchProducts(el)]);

    if (isEditMode) {
        await loadOrderData(el, id);
    }

    el.querySelector("#productSelect").addEventListener("change", () => calculateTotal(el));
    el.querySelector("#quantity").addEventListener("input", () => calculateTotal(el));
    el.querySelector("#btnCancel").addEventListener("click", () => router.navigate("/orders"));
    el.querySelector("#orderForm").addEventListener("submit", (event) =>
        handleFormSubmit(event, el, isEditMode, id),
    );
}
