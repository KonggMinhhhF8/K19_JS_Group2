import httpRequest from "../../utils/httpRequest.js";
import { renderSidebarHTML, initSidebar } from "../shared/sidebar.js";
import { router } from "../router.js";
import "./orders.css";

function getOrderDetailsHTML() {
    return `
    <div class="orders-page">
        <div class="overlay" id="overlay"></div>
        <div class="container">
            ${renderSidebarHTML("orders")}
            <main class="main-content">
                <header>
                    <button class="menu-btn" id="menuToggle"><i class="fas fa-bars"></i></button>
                    <h1>Chi Tiết Đơn Hàng <span id="order-id-title"></span></h1>
                </header>

                <section class="details-container">
                    <div id="loading" style="text-align: center; padding: 20px;">Đang tải dữ liệu...</div>

                    <div id="order-details-content" style="display: none;">
                        <div class="detail-group">
                            <strong>Mã đơn hàng:</strong>
                            <span id="detail-id"></span>
                        </div>
                        <div class="detail-group">
                            <strong>Ngày đặt:</strong>
                            <span id="detail-date"></span>
                        </div>
                        <div class="detail-group">
                            <strong>Trạng thái:</strong>
                            <span id="detail-status"></span>
                        </div>

                        <h3 style="margin: 20px 0 10px; color: var(--primary-color);">Thông tin khách hàng</h3>
                        <div class="detail-group">
                            <strong>Họ tên:</strong>
                            <span id="detail-customer-name"></span>
                        </div>
                        <div class="detail-group">
                            <strong>Email:</strong>
                            <span id="detail-customer-email"></span>
                        </div>
                        <div class="detail-group">
                            <strong>Số điện thoại:</strong>
                            <span id="detail-customer-phone"></span>
                        </div>

                        <h3 style="margin: 20px 0 10px; color: var(--primary-color);">Thông tin sản phẩm</h3>
                        <div class="detail-group">
                            <strong>Tên sản phẩm:</strong>
                            <span id="detail-product-name"></span>
                        </div>
                        <div class="detail-group">
                            <strong>Đơn giá:</strong>
                            <span id="detail-product-price"></span>
                        </div>
                        <div class="detail-group">
                            <strong>Số lượng:</strong>
                            <span id="detail-amount"></span>
                        </div>
                        <div class="detail-group">
                            <strong>Tổng tiền:</strong>
                            <strong id="detail-total" style="color: var(--danger); font-size: 1.2rem;"></strong>
                        </div>

                        <div class="btn-container">
                            <button class="btn btn-back" id="btnBack">Quay lại</button>
                            <button class="btn btn-edit" id="btn-edit-order">Sửa đơn hàng</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    </div>
    `;
}

async function loadOrderDetails(el, id) {
    try {
        // Fetch all orders and find since GET /orders/{id} is not in API
        const orders = await httpRequest.get("orders");
        const order = orders.find((o) => o.id == id);

        if (!order) {
            alert("Không tìm thấy đơn hàng!");
            router.navigate("/orders");
            return;
        }

        renderDetails(el, order);
    } catch (error) {
        console.error("Lỗi khi tải thông tin chi tiết đơn hàng:", error);
        alert("Không tìm thấy đơn hàng!");
        router.navigate("/orders");
    }
}

function renderDetails(el, order) {
    el.querySelector("#loading").style.display = "none";
    el.querySelector("#order-details-content").style.display = "block";

    el.querySelector("#order-id-title").textContent = `#ORD-${order.id}`;
    el.querySelector("#detail-id").textContent = `#ORD-${order.id}`;
    el.querySelector("#detail-date").textContent = order.date || "N/A";

    const statusMap = {
        pending: { label: "Chờ xử lý", class: "pending" },
        delivering: { label: "Đang giao", class: "shipping" },
        done: { label: "Hoàn thành", class: "completed" },
        cancel: { label: "Đã hủy", class: "cancelled" },
    };
    const statusInfo = statusMap[order.status] || { label: order.status, class: "pending" };
    el.querySelector("#detail-status").innerHTML = `<span class="badge ${statusInfo.class}">${statusInfo.label}</span>`;

    el.querySelector("#detail-customer-name").textContent = order.customer?.name || "Khách lẻ";
    el.querySelector("#detail-customer-email").textContent = order.customer?.email || "N/A";
    el.querySelector("#detail-customer-phone").textContent = order.customer?.phone || "N/A";

    el.querySelector("#detail-product-name").textContent = order.product?.name || "N/A";
    const price = order.product?.price || 0;
    el.querySelector("#detail-product-price").textContent = `${price.toLocaleString("vi-VN")}đ`;
    el.querySelector("#detail-amount").textContent = order.amount || 1;

    const total = price * (order.amount || 1);
    el.querySelector("#detail-total").textContent = `${total.toLocaleString("vi-VN")}đ`;
}

export async function mountOrderDetailsPage(el, id) {
    if (!localStorage.getItem("refreshToken")) {
        localStorage.setItem("redirectAfterLogin", "/orders");
        router.navigate("/login");
        return;
    }

    el.innerHTML = getOrderDetailsHTML();
    initSidebar(el, router);

    if (!id) {
        alert("Không tìm thấy mã đơn hàng");
        router.navigate("/orders");
        return;
    }

    await loadOrderDetails(el, id);

    el.querySelector("#btnBack").addEventListener("click", () => router.navigate("/orders"));
    el.querySelector("#btn-edit-order").addEventListener("click", () => router.navigate(`/orders/edit/${id}`));
}
