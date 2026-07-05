import httpRequest from "../../utils/httpRequest.js";
import authGuard from "../../utils/authGuard.js";
import logout from "../../utils/logout.js";

let revenueChart = null;
let categoryChart = null;

let allProducts = [];
let allOrders = [];
let allCategories = [];

document.addEventListener("DOMContentLoaded", () => {
    if (!authGuard()) return;

    initializeDateFilter();
    loadReport();

    const btnFilter = document.getElementById("btnFilter");
    if (btnFilter) {
        btnFilter.addEventListener("click", filterReport);
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});

async function loadReport() {
    try {
        const [products, orders, categories] = await Promise.all([
            httpRequest.get("products"),
            httpRequest.get("orders"),
            httpRequest.get("categories"),
        ]);

        allProducts = Array.isArray(products) ? products : [];
        allOrders = Array.isArray(orders) ? orders : [];
        allCategories = Array.isArray(categories) ? categories : [];

        renderSummary(allProducts, allOrders, allCategories);
        renderRevenueChart(allOrders);
        renderCategoryChart(allOrders, allProducts, allCategories);
        renderTopProducts(allOrders);

    } catch (error) {
        console.error(error);
        alert("Không thể tải dữ liệu báo cáo. Vui lòng đăng nhập lại.");
    }
}


function initializeDateFilter() {
    const today = new Date();


    const firstDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const fromDate =
        document.getElementById("fromDate");

    const toDate =
        document.getElementById("toDate");

    if (fromDate) {
        fromDate.value =
            firstDay
                .toISOString()
                .split("T")[0];
    }

    if (toDate) {
        toDate.value =
            today
                .toISOString()
                .split("T")[0];
    }


}

function filterReport() {


    const fromDate =
        document.getElementById("fromDate").value;

    const toDate =
        document.getElementById("toDate").value;

    let filteredOrders = [...allOrders];

    if (fromDate) {
        filteredOrders =
            filteredOrders.filter(
                order => order.date >= fromDate
            );
    }

    if (toDate) {
        filteredOrders =
            filteredOrders.filter(
                order => order.date <= toDate
            );
    }

    renderSummary(
        allProducts,
        filteredOrders,
        allCategories
    );

    renderRevenueChart(filteredOrders);

    renderCategoryChart(filteredOrders, allProducts, allCategories);

    renderTopProducts(filteredOrders);


}

function renderSummary(
    products,
    orders,
    categories
) {

    const revenue =
        orders.reduce(
            (sum, order) =>
                sum +
                (
                    (order.amount || 0)
                    *
                    (
                        order.product?.price || 0
                    )
                ),
            0
        );

    const lowStock =
        products.filter(
            product =>
                product.remaining <= 10
        ).length;

    document.getElementById(
        "totalRevenue"
    ).textContent =
        formatCurrency(revenue);

    document.getElementById(
        "totalOrders"
    ).textContent =
        orders.length;

    document.getElementById(
        "lowStockProducts"
    ).textContent =
        lowStock;

    document.getElementById(
        "totalCategories"
    ).textContent =
        categories.length;

    // Update trend indicators
    const totalProducts = products.length;
    const revenueTrend = document.getElementById("revenueTrend");
    const ordersTrend = document.getElementById("ordersTrend");
    const stockTrend = document.getElementById("stockTrend");
    const categoryTrend = document.getElementById("categoryTrend");

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

function renderRevenueChart(orders) {


    const revenueMap = {};

    orders.forEach(order => {

        const date = order.date;

        const revenue =
            (order.amount || 0)
            *
            (
                order.product?.price || 0
            );

        revenueMap[date] =
            (
                revenueMap[date] || 0
            )
            +
            revenue;
    });

    const labels =
        Object.keys(revenueMap).sort();

    const values =
        labels.map(
            label =>
                revenueMap[label]
        );

    const ctx =
        document.getElementById(
            "revenueChart"
        );

    if (revenueChart) {
        revenueChart.destroy();
    }

    revenueChart =
        new Chart(ctx, {

            type: "line",

            data: {

                labels,

                datasets: [

                    {
                        label: "Revenue",

                        data: values,

                        borderColor: "#3498db",

                        backgroundColor:
                            "rgba(52,152,219,0.15)",

                        fill: true,

                        tension: 0.3
                    }
                ]
            }
        });


}

function renderCategoryChart(orders, products, categories) {

    // Tính doanh thu theo danh mục từ orders (dùng orders + products + categories)
    // Map productId -> categoryName từ danh sách products
    const productCategoryMap = {};
    products.forEach(product => {
        productCategoryMap[product.id] =
            product.category?.name || "Không rõ";
    });

    // Group doanh thu theo category từ orders
    const categoryRevenueMap = {};

    orders.forEach(order => {
        if (!order.product) return;

        const catName =
            order.product.category?.name ||
            productCategoryMap[order.product.id] ||
            "Không rõ";

        const revenue =
            (order.amount || 0) * (order.product.price || 0);

        categoryRevenueMap[catName] =
            (categoryRevenueMap[catName] || 0) + revenue;
    });

    // Nếu không có dữ liệu orders, fallback sang đếm số sản phẩm theo danh mục
    let labels, values;
    if (Object.keys(categoryRevenueMap).length === 0) {
        const countMap = {};
        products.forEach(product => {
            const catName = product.category?.name || "Không rõ";
            countMap[catName] = (countMap[catName] || 0) + 1;
        });
        labels = Object.keys(countMap);
        values = Object.values(countMap);
    } else {
        labels = Object.keys(categoryRevenueMap);
        values = Object.values(categoryRevenueMap);
    }

    const ctx =
        document.getElementById(
            "categoryChart"
        );

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart =
        new Chart(ctx, {

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
                            "#1abc9c"
                        ]
                    }
                ]
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
                            }
                        }
                    }
                }
            }
        });


}

function renderTopProducts(orders) {


    const tbody =
        document.getElementById(
            "topProductsBody"
        );

    if (!tbody) {
        return;
    }

    const productMap = {};

    orders.forEach(order => {

        const product =
            order.product;

        if (!product) {
            return;
        }

        const id = product.id;

        if (!productMap[id]) {

            productMap[id] = {

                name: product.name,

                sold: 0,

                revenue: 0,

                remaining:
                    product.remaining
            };
        }

        productMap[id].sold +=
            (
                order.amount || 0
            );

        productMap[id].revenue +=
            (
                order.amount || 0
            )
            *
            (
                product.price || 0
            );
    });

    const products =
        Object.values(productMap)
            .sort(
                (a, b) =>
                    b.sold - a.sold
            )
            .slice(0, 10);

    if (products.length === 0) {

        tbody.innerHTML = `
        <tr>
            <td colspan="4">
                No data available
            </td>
        </tr>
    `;

        return;
    }

    tbody.innerHTML = "";

    products.forEach(product => {

        tbody.innerHTML += `
        <tr>
            <td>${product.name}</td>

            <td>${product.sold}</td>

            <td>
                ${formatCurrency(
            product.revenue
        )}
            </td>

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


    return Number(
        amount || 0
    ).toLocaleString(
        "vi-VN"
    ) + " đ";


}
