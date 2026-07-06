import httpRequest from "../../utils/httpRequest.js";
import { renderSidebarHTML, initSidebar } from "../shared/sidebar.js";
import { router } from "../router.js";
import "./report.css";

let revenueChart = null;
let categoryChart = null;

let allProducts = [];
let allOrders = [];
let allCategories = [];

function getReportContentHTML() {
    return `
    <div class="reports-page">
        <div class="overlay" id="overlay"></div>
        <div class="container">
            ${renderSidebarHTML("reports")}
            <main class="main-content">
                <header>
                    <button class="menu-btn" id="menuToggle"><i class="fas fa-bars"></i></button>
                    <h2>Báo cáo kinh doanh</h2>
                    <div class="filter-group">
                        <input type="date" id="fromDate">
                        <input type="date" id="toDate">
                        <button id="btnFilter">Lọc</button>
                    </div>
                    <div class="user-info">
                        <i class="fas fa-user-circle"></i>
                        <span>Admin</span>
                    </div>
                </header>

                <div class="stats-grid">
                    <div class="stat-card">
                        <h4>Doanh thu</h4>
                        <div class="value" id="totalRevenue">0đ</div>
                        <div class="trend up" id="revenueTrend"><i class="fas fa-arrow-up"></i> --</div>
                    </div>
                    <div class="stat-card">
                        <h4>Đơn hàng</h4>
                        <div class="value" id="totalOrders">0</div>
                        <div class="trend up" id="ordersTrend"><i class="fas fa-arrow-up"></i> --</div>
                    </div>
                    <div class="stat-card">
                        <h4>Sắp hết hàng</h4>
                        <div class="value" id="lowStockProducts">0</div>
                        <div class="trend down" id="stockTrend"><i class="fas fa-arrow-down"></i> --</div>
                    </div>
                    <div class="stat-card">
                        <h4>Danh mục</h4>
                        <div class="value" id="totalCategories">0</div>
                        <div class="trend up" id="categoryTrend"><i class="fas fa-arrow-up"></i> --</div>
                    </div>
                </div>

                <div class="charts-container">
                    <div class="chart-box">
                        <h3>Biểu đồ doanh thu</h3>
                        <canvas id="revenueChart"></canvas>
                    </div>
                    <div class="chart-box">
                        <h3>Cơ cấu sản phẩm</h3>
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>

                <div class="top-products">
                    <h3>Sản phẩm bán chạy nhất</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Số lượng bán</th>
                                <th>Doanh thu</th>
                                <th>Tình trạng</th>
                            </tr>
                        </thead>
                        <tbody id="topProductsBody"></tbody>
                    </table>
                </div>
            </main>
        </div>
    </div>
    `;
}

async function loadReport(el) {
    try {
        const [products, orders, categories] = await Promise.all([
            httpRequest.get("products"),
            httpRequest.get("orders"),
            httpRequest.get("categories"),
        ]);

        allProducts = Array.isArray(products) ? products : [];
        allOrders = Array.isArray(orders) ? orders : [];
        allCategories = Array.isArray(categories) ? categories : [];

        renderSummary(el, allProducts, allOrders, allCategories);
        renderRevenueChart(el, allOrders);
        renderCategoryChart(el, allOrders, allProducts, allCategories);
        renderTopProducts(el, allOrders);
    } catch (error) {
        console.error(error);
        alert("Không thể tải dữ liệu báo cáo. Vui lòng đăng nhập lại.");
    }
}

function initializeDateFilter(el) {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    const fromDate = el.querySelector("#fromDate");
    const toDate = el.querySelector("#toDate");

    if (fromDate) fromDate.value = firstDay.toISOString().split("T")[0];
    if (toDate) toDate.value = today.toISOString().split("T")[0];
}

function filterReport(el) {
    const fromDate = el.querySelector("#fromDate").value;
    const toDate = el.querySelector("#toDate").value;

    let filteredOrders = [...allOrders];
    if (fromDate) {
        filteredOrders = filteredOrders.filter((order) => order.date >= fromDate);
    }
    if (toDate) {
        filteredOrders = filteredOrders.filter((order) => order.date <= toDate);
    }

    renderSummary(el, allProducts, filteredOrders, allCategories);
    renderRevenueChart(el, filteredOrders);
    renderCategoryChart(el, filteredOrders, allProducts, allCategories);
    renderTopProducts(el, filteredOrders);
}

function renderSummary(el, products, orders, categories) {
    const revenue = orders.reduce(
        (sum, order) => sum + (order.amount || 0) * (order.product?.price || 0),
        0,
    );
    const lowStock = products.filter((product) => product.remaining <= 10).length;

    el.querySelector("#totalRevenue").textContent = formatCurrency(revenue);
    el.querySelector("#totalOrders").textContent = orders.length;
    el.querySelector("#lowStockProducts").textContent = lowStock;
    el.querySelector("#totalCategories").textContent = categories.length;

    const totalProducts = products.length;
    const revenueTrend = el.querySelector("#revenueTrend");
    const ordersTrend = el.querySelector("#ordersTrend");
    const stockTrend = el.querySelector("#stockTrend");
    const categoryTrend = el.querySelector("#categoryTrend");

    if (revenueTrend) {
        revenueTrend.className = "trend up";
        revenueTrend.innerHTML = `<i class="fas fa-arrow-up"></i> ${orders.length > 0 ? "Dữ liệu cập nhật" : "Chưa có dữ liệu"}`;
    }

    if (ordersTrend) {
        ordersTrend.className = orders.length > 0 ? "trend up" : "trend down";
        ordersTrend.innerHTML = orders.length > 0
            ? `<i class="fas fa-arrow-up"></i> ${orders.length} đơn`
            : `<i class="fas fa-arrow-down"></i> Chưa có đơn`;
    }

    if (stockTrend) {
        stockTrend.className = lowStock > 0 ? "trend down" : "trend up";
        stockTrend.innerHTML = lowStock > 0
            ? `<i class="fas fa-arrow-down"></i> ${lowStock} sản phẩm cần nhập`
            : `<i class="fas fa-arrow-up"></i> Đủ hàng`;
    }

    if (categoryTrend) {
        categoryTrend.className = "trend up";
        categoryTrend.innerHTML = `<i class="fas fa-arrow-up"></i> ${totalProducts} sản phẩm`;
    }
}

function renderRevenueChart(el, orders) {
    const revenueMap = {};
    orders.forEach((order) => {
        const date = order.date;
        const revenue = (order.amount || 0) * (order.product?.price || 0);
        revenueMap[date] = (revenueMap[date] || 0) + revenue;
    });

    const labels = Object.keys(revenueMap).sort();
    const values = labels.map((label) => revenueMap[label]);

    const ctx = el.querySelector("#revenueChart");

    if (revenueChart) {
        revenueChart.destroy();
    }

    revenueChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Revenue",
                    data: values,
                    borderColor: "#3498db",
                    backgroundColor: "rgba(52,152,219,0.15)",
                    fill: true,
                    tension: 0.3,
                },
            ],
        },
    });
}

function renderCategoryChart(el, orders, products, categories) {
    const productCategoryMap = {};
    products.forEach((product) => {
        productCategoryMap[product.id] = product.category?.name || "Không rõ";
    });

    const categoryRevenueMap = {};
    orders.forEach((order) => {
        if (!order.product) return;

        const catName =
            order.product.category?.name ||
            productCategoryMap[order.product.id] ||
            "Không rõ";

        const revenue = (order.amount || 0) * (order.product.price || 0);

        categoryRevenueMap[catName] = (categoryRevenueMap[catName] || 0) + revenue;
    });

    let labels, values;
    if (Object.keys(categoryRevenueMap).length === 0) {
        const countMap = {};
        products.forEach((product) => {
            const catName = product.category?.name || "Không rõ";
            countMap[catName] = (countMap[catName] || 0) + 1;
        });
        labels = Object.keys(countMap);
        values = Object.values(countMap);
    } else {
        labels = Object.keys(categoryRevenueMap);
        values = Object.values(categoryRevenueMap);
    }

    const ctx = el.querySelector("#categoryChart");

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        "#3498db",
                        "#2ecc71",
                        "#f1c40f",
                        "#9b59b6",
                        "#e74c3c",
                        "#1abc9c",
                    ],
                },
            ],
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (ctx) {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const val = ctx.parsed;
                            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                            return `${ctx.label}: ${pct}%`;
                        },
                    },
                },
            },
        },
    });
}

function renderTopProducts(el, orders) {
    const tbody = el.querySelector("#topProductsBody");
    if (!tbody) return;

    const productMap = {};

    orders.forEach((order) => {
        const product = order.product;
        if (!product) return;

        const id = product.id;
        if (!productMap[id]) {
            productMap[id] = {
                name: product.name,
                sold: 0,
                revenue: 0,
                remaining: product.remaining,
            };
        }

        productMap[id].sold += order.amount || 0;
        productMap[id].revenue += (order.amount || 0) * (product.price || 0);
    });

    const products = Object.values(productMap)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10);

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">No data available</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    products.forEach((product) => {
        tbody.innerHTML += `
        <tr>
            <td>${product.name}</td>
            <td>${product.sold}</td>
            <td>${formatCurrency(product.revenue)}</td>
            <td>
                ${product.remaining > 10
                ? '<span class="in-stock">Còn hàng</span>'
                : '<span class="low-stock">Sắp hết</span>'
            }
            </td>
        </tr>
    `;
    });
}

function formatCurrency(amount) {
    return Number(amount || 0).toLocaleString("vi-VN") + " đ";
}

export function mount(el) {
    if (!localStorage.getItem("refreshToken")) {
        localStorage.setItem("redirectAfterLogin", "/reports");
        router.navigate("/login");
        return;
    }

    el.innerHTML = getReportContentHTML();
    initSidebar(el, router);
    initializeDateFilter(el);
    loadReport(el);

    const btnFilter = el.querySelector("#btnFilter");
    if (btnFilter) {
        btnFilter.addEventListener("click", () => filterReport(el));
    }
}
