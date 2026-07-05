import httpRequest from "../../utils/httpRequest.js";
import getNewAccessToken from "../../utils/getNewAccessToken.js";
import { renderSidebarHTML, initSidebar } from "../shared/sidebar.js";
import { router } from "../router.js";

const statusMap = {
  done: { label: "Thành công", bg: "#e8f5e9", color: "#27ae60" },
  delivering: { label: "Đang vận chuyển", bg: "#e1f5fe", color: "#0288d1" },
  cancel: { label: "Đã hủy", bg: "#ffebee", color: "#c0392b" },
};

function getHomeContentHTML() {
  return `
        <style>
            :root {
                --primary-color: #3498db;
                --dark-color: #2c3e50;
                --bg-color: #f4f7f6;
            }

            body { background-color: var(--bg-color); display: block; }

            .container { display: flex; min-height: 100vh; }

            .sidebar {
                width: 260px; background: var(--dark-color); color: white;
                padding: 25px; position: fixed; top: 0; left: 0; height: 100vh;
                z-index: 1000; transition: 0.3s; display: flex; flex-direction: column;
            }
            .sidebar h2 { margin-bottom: 40px; text-align: center; color: var(--primary-color); }
            .sidebar ul { list-style: none; }
            .sidebar ul li { padding: 15px; cursor: pointer; border-radius: 8px; margin-bottom: 5px; color: #ecf0f1; transition: 0.3s; }
            .sidebar ul li:hover, .sidebar ul li.active { background: #34495e; color: var(--primary-color); }
            .sidebar ul li a { color: inherit; text-decoration: none; display: block; }
            .sidebar ul li i { margin-right: 12px; width: 20px; }

            .menu-btn { display: none; background: none; border: none; font-size: 1.4rem; cursor: pointer; }

            .overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; }
            .overlay.active { display: block; }

            .logout-btn {
                margin-top: auto; padding: 12px; cursor: pointer; border-radius: 8px;
                display: flex; align-items: center; color: #e74c3c;
                background: transparent; border: none; width: 100%; font-size: 1rem;
                text-align: left; transition: 0.2s;
                border-top: 1px solid rgba(255,255,255,0.1); padding-top: 18px;
            }
            .logout-btn i { margin-right: 15px; }
            .logout-btn:hover { background: rgba(231, 76, 60, 0.15); }

            .main-content { flex: 1; padding: 30px; margin-left: 260px; transition: 0.3s; }

            header {
                display: flex; justify-content: space-between; align-items: center;
                background: white; padding: 15px 25px; border-radius: 12px;
                margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .user-info { color: var(--dark-color); }
            .user-info i { margin-left: 8px; color: var(--primary-color); }

            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .card h3 { font-size: 0.85rem; color: #7f8c8d; text-transform: uppercase; margin-bottom: 8px; }
            .card p { font-size: 1.6rem; font-weight: bold; color: var(--dark-color); }

            .table-container { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; max-height: 400px; }
            .table-header { padding: 20px; border-bottom: 1px solid #eee; }
            .table-header h3 { color: var(--dark-color); }
            .table-scroll { overflow: auto; flex: 1; }
            table { width: 100%; border-collapse: collapse; min-width: 600px; }
            th { text-align: left; padding: 15px; background: #f8f9fa; color: #7f8c8d; font-size: 0.85rem; position: sticky; top: 0; }
            td { padding: 15px; border-bottom: 1px solid #eee; }
            .status { padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }

            @media (max-width: 992px) {
                .sidebar { left: -100%; }
                .sidebar.active { left: 0; }
                .main-content { margin-left: 0; }
                .menu-btn { display: block; }
            }
        </style>

        <div class="overlay" id="overlay"></div>
        <div class="container">
            ${renderSidebarHTML("home")}
            <main class="main-content">
                <header>
                    <button class="menu-btn" id="menuToggle"><i class="fas fa-bars"></i></button>
                    <div class="user-info"><strong>Admin</strong> <i class="fas fa-user-circle"></i></div>
                </header>

                <section class="stats">
                    <div class="card">
                        <h3>Doanh thu</h3>
                        <p id="revenue">Đang tải...</p>
                    </div>
                    <div class="card">
                        <h3>Đơn mới</h3>
                        <p id="newOrders">Đang tải...</p>
                    </div>
                </section>

                <section class="table-container">
                    <div class="table-header">
                        <h3>Đơn hàng gần đây</h3>
                    </div>
                    <div class="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Khách hàng</th>
                                    <th>Trạng thái</th>
                                    <th>Tổng tiền</th>
                                </tr>
                            </thead>
                            <tbody id="tableBody"></tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    `;
}

function render(el, orders) {
  const newOrdersEl = el.querySelector("#newOrders");
  const revenueEl = el.querySelector("#revenue");
  const tableBody = el.querySelector("#tableBody");

  if (!orders || orders.length === 0) {
    newOrdersEl.textContent = "0";
    revenueEl.textContent = "0Đ";
    return;
  }

  newOrdersEl.textContent = orders.length;

  const totalRevenue = orders.reduce((sum, order) => {
    const status = order.status ? order.status.toLowerCase() : "";
    if (status === "done") {
      const price = order?.product?.price || 0;
      const amount = order?.amount || 0;
      return sum + price * amount;
    }
    return sum;
  }, 0);
  revenueEl.textContent = totalRevenue.toLocaleString("vi-VN") + "Đ";

  tableBody.innerHTML = "";
  orders.forEach((order) => {
    const tr = document.createElement("tr");

    const tId = document.createElement("td");
    tId.textContent = order?.id || "N/A";
    tr.appendChild(tId);

    const tdName = document.createElement("td");
    tdName.textContent = order?.customer?.name || "Khách lẻ";
    tr.appendChild(tdName);

    const tdStatus = document.createElement("td");
    const spanStatus = document.createElement("span");
    const statusInfo = statusMap[(order.status || "").toLowerCase()] || {
      label: order.status || "N/A",
      bg: "#fff3e0",
      color: "#e67e22",
    };
    spanStatus.textContent = statusInfo.label;
    spanStatus.classList.add("status");
    spanStatus.style.background = statusInfo.bg;
    spanStatus.style.color = statusInfo.color;
    tdStatus.appendChild(spanStatus);
    tr.appendChild(tdStatus);

    const tdTotal = document.createElement("td");
    const price = order?.product?.price || 0;
    const amount = order?.amount || 0;
    tdTotal.textContent = (price * amount).toLocaleString("vi-VN") + "Đ";
    tr.appendChild(tdTotal);

    tableBody.appendChild(tr);
  });
}

async function fetchOrders(el) {
  try {
    const orders = await httpRequest.get("orders");
    render(el, orders);
  } catch (error) {
    try {
      await getNewAccessToken();
      const orders = await httpRequest.get("orders");
      render(el, orders);
    } catch (retryError) {
      console.error("Lỗi khi tải đơn hàng trang tổng quan:", retryError);
    }
  }
}

export function mount(el) {
  if (!localStorage.getItem("refreshToken")) {
    localStorage.setItem("redirectAfterLogin", "/home");
    router.navigate("/login");
    return;
  }

  el.innerHTML = getHomeContentHTML();
  initSidebar(el, router);
  fetchOrders(el);
}
