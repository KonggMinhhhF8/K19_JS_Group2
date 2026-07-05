import httpRequest from "../../utils/httpRequest.js";
import { renderSidebarHTML, initSidebar } from "../shared/sidebar.js";
import { router } from "../router.js";
import "./orders.css";

let allOrders = [];
let currentFilter = "all";
let searchQuery = "";

function getOrderListHTML() {
    return `
    <div class="orders-page">
        <div class="overlay" id="overlay"></div>
        <div class="container">
            ${renderSidebarHTML("orders")}
            <main class="main-content">
                <header>
                    <button class="menu-btn" id="menuToggle"><i class="fas fa-bars"></i></button>
                    <div class="search-bar">
                        <input type="text" id="orderSearch" placeholder="Tìm mã đơn, tên khách hàng...">
                    </div>
                    <button class="btn-export" id="btnCreateOrder"><i class="fas fa-plus"></i> Tạo đơn hàng</button>
                </header>

                <section class="stats">
                    <div class="card blue"><h3>Tổng đơn hàng</h3><p id="statTotal">0</p></div>
                    <div class="card orange"><h3>Đang xử lý</h3><p id="statPending">0</p></div>
                    <div class="card green"><h3>Thành công</h3><p id="statDone">0</p></div>
                    <div class="card red"><h3>Đã hủy</h3><p id="statCancel">0</p></div>
                </section>

                <section class="table-container">
                    <div class="order-controls">
                        <div class="tabs">
                            <button class="tab active" data-filter="all">Tất cả</button>
                            <button class="tab" data-filter="pending">Chờ xử lý</button>
                            <button class="tab" data-filter="delivering">Đang giao</button>
                            <button class="tab" data-filter="done">Đã xong</button>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Sản phẩm</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="order-list"></tbody>
                    </table>
                </section>
            </main>
        </div>
    </div>
    `;
}

function filterAndRenderOrders(el) {
    let filtered = allOrders;

    if (currentFilter !== "all") {
        filtered = filtered.filter((o) => o.status === currentFilter);
    }

    if (searchQuery !== "") {
        filtered = filtered.filter((o) => {
            const idMatch = `ord-${o.id}`.includes(searchQuery);
            const nameMatch = (o.customer?.name || "").toLowerCase().includes(searchQuery);
            return idMatch || nameMatch;
        });
    }

    renderOrders(el, filtered);
}

function renderOrders(el, orders) {
    const tbody = el.querySelector("#order-list");
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Chưa có đơn hàng nào</td></tr>';
        return;
    }

    const statusMap = {
        pending: { label: "Chờ xử lý", class: "pending" },
        delivering: { label: "Đang giao", class: "shipping" },
        done: { label: "Hoàn thành", class: "completed" },
        cancel: { label: "Đã hủy", class: "cancelled" },
    };

    tbody.innerHTML = orders
        .map((order) => {
            const statusInfo = statusMap[order.status] || { label: order.status, class: "pending" };
            const price = order.product?.price || 0;
            const total = price * (order.amount || 1);

            return `
        <tr>
            <td><strong>#ORD-${order.id}</strong></td>
            <td>${order.customer?.name || "Khách lẻ"}<br><small>${order.customer?.phone || ""}</small></td>
            <td>${order.product?.name || "Sản phẩm không tồn tại"} (x${order.amount || 1})</td>
            <td>${total.toLocaleString("vi-VN")}đ</td>
            <td><span class="badge ${statusInfo.class}">${statusInfo.label}</span></td>
            <td>
                <button class="btn-action" title="Xem chi tiết" data-view-id="${order.id}"><i class="fas fa-eye"></i></button>
                <button class="btn-action" title="Sửa" data-edit-id="${order.id}"><i class="fas fa-edit"></i></button>
                <button class="btn-action" title="Xóa" data-delete-id="${order.id}"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
        `;
        })
        .join("");
}

function updateStats(el, orders) {
    el.querySelector("#statTotal").textContent = orders.length.toLocaleString("vi-VN");
    el.querySelector("#statPending").textContent = orders.filter((o) => o.status === "pending").length.toLocaleString("vi-VN");
    el.querySelector("#statDone").textContent = orders.filter((o) => o.status === "done").length.toLocaleString("vi-VN");
    el.querySelector("#statCancel").textContent = orders.filter((o) => o.status === "cancel").length.toLocaleString("vi-VN");
}

async function fetchOrders(el) {
    try {
        allOrders = await httpRequest.get("orders");
    } catch (error) {
        console.error("Lỗi khi tải danh sách đơn hàng:", error);
        allOrders = [];
    }
    updateStats(el, allOrders);
    filterAndRenderOrders(el);
}

async function deleteOrder(el, id) {
    if (!confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) return;

    try {
        await httpRequest.del(`orders/${id}`);
        fetchOrders(el);
    } catch (error) {
        console.error("Lỗi khi xóa:", error);
        alert("Xóa thất bại!");
    }
}

export function mountOrderListPage(el) {
    if (!localStorage.getItem("refreshToken")) {
        localStorage.setItem("redirectAfterLogin", "/orders");
        router.navigate("/login");
        return;
    }

    el.innerHTML = getOrderListHTML();
    initSidebar(el, router);

    el.querySelector("#orderSearch").addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        filterAndRenderOrders(el);
    });

    el.querySelectorAll(".tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            el.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            currentFilter = tab.dataset.filter;
            filterAndRenderOrders(el);
        });
    });

    el.querySelector("#btnCreateOrder").addEventListener("click", () => {
        router.navigate("/orders/create");
    });

    el.querySelector("#order-list").addEventListener("click", (event) => {
        const viewBtn = event.target.closest("[data-view-id]");
        const editBtn = event.target.closest("[data-edit-id]");
        const deleteBtn = event.target.closest("[data-delete-id]");

        if (viewBtn) router.navigate(`/orders/${viewBtn.dataset.viewId}`);
        if (editBtn) router.navigate(`/orders/edit/${editBtn.dataset.editId}`);
        if (deleteBtn) deleteOrder(el, deleteBtn.dataset.deleteId);
    });

    fetchOrders(el);
}
