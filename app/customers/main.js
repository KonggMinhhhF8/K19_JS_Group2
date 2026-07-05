import httpRequest from "../../utils/httpRequest.js";
import getNewAccessToken from "../../utils/getNewAccessToken.js";
import { createModal } from "./modal.js";
import { renderCustomerRow, createStatCard } from "./render.js";
import { router } from "../router.js";
import { renderSidebarHTML, initSidebar } from "../shared/sidebar.js";

export function mount(el) {
  if (!localStorage.getItem("refreshToken")) {
    localStorage.setItem("redirectAfterLogin", "/customers");
    router.navigate("/login");
    return;
  }

  el.innerHTML = `
        <style>
            :root {
                --primary-color: #3498db;
                --dark-color: #2c3e50;
                --bg-color: #f4f7f6;
                --gold: #f1c40f;
                --silver: #95a5a6;
                --bronze: #d35400;
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

            .main-content { flex: 1; padding: 30px; margin-left: 260px; transition: 0.3s; }

            header { display: flex; justify-content: space-between; align-items: center; background: white; padding: 15px 25px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }

            .search-bar input { padding: 10px 20px; width: 350px; border: 1px solid #ddd; border-radius: 25px; outline: none; }

            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .card h3 { font-size: 0.85rem; color: #7f8c8d; text-transform: uppercase; margin-bottom: 10px; }
            .card p { font-size: 1.8rem; font-weight: bold; color: var(--dark-color); }

            .table-container { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow-x: auto; }
            .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }

            table { width: 100%; border-collapse: collapse; min-width: 650px; }
            th { text-align: left; padding: 15px; background: #f8f9fa; color: #666; font-size: 0.9rem; }
            td { padding: 15px; border-bottom: 1px solid #eee; font-size: 0.95rem; }

            .cust-info { display: flex; align-items: center; gap: 12px; }
            .avatar { width: 40px; height: 40px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #7f8c8d; }

            .tier { padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; color: white; }
            .tier.gold { background: var(--gold); }
            .tier.silver { background: var(--silver); }
            .tier.bronze { background: var(--bronze); }

            .btn-add { background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
            .btn-action { border: none; background: #f0f2f5; padding: 8px; border-radius: 6px; cursor: pointer; color: #555; }
            .btn-action:hover { background: #e0e0e0; }

            small { color: #7f8c8d; }

            .logout-btn {
                margin-top: auto; padding: 12px; cursor: pointer; border-radius: 8px;
                display: flex; align-items: center; color: #e74c3c;
                background: transparent; border: none; width: 100%; font-size: 1rem;
                text-align: left; transition: 0.2s;
                border-top: 1px solid rgba(255,255,255,0.1); padding-top: 18px;
            }
            .logout-btn i { margin-right: 15px; }
            .logout-btn:hover { background: rgba(231, 76, 60, 0.15); }

            @media (max-width: 992px) {
                .sidebar { left: -100%; }
                .sidebar.active { left: 0; }
                .main-content { margin-left: 0; }
                .menu-btn { display: block; }
            }
            @media (max-width: 600px) {
                .stats { grid-template-columns: repeat(2, 1fr); }
                .search-bar input { width: 200px; }
                header { flex-wrap: wrap; gap: 10px; }
            }
        </style>

        <div class="overlay" id="overlay"></div>
        <div class="container">
            ${renderSidebarHTML("customers")}

            <main class="main-content">
                <header>
                    <button class="menu-btn" id="menuToggle"><i class="fas fa-bars"></i></button>
                    <div class="search-bar">
                        <input type="text" id="search" placeholder="Tìm tên hoặc email">
                    </div>
                    <button class="btn-add" id="addCustomerBtn">
                        <i class="fas fa-user-plus"></i> Thêm khách hàng
                    </button>
                </header>

                <section class="stats" id="statsSection"></section>

                <section class="table-container">
                    <div class="table-header">
                        <h3>Danh sách khách hàng</h3>
                        <select id="tierFilter" style="padding: 8px; border-radius: 5px; border: 1px solid #ddd;">
                            <option value="">Hạng: Tất cả</option>
                            <option value="gold">Hạng: Vàng</option>
                            <option value="silver">Hạng: Bạc</option>
                            <option value="bronze">Hạng: Đồng</option>
                        </select>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Khách hàng</th>
                                <th>Liên hệ</th>
                                <th>Hạng</th>
                                <th>Đơn hàng</th>
                                <th>Tổng chi tiêu</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </section>
            </main>
        </div>
    `;

  // Nút "Thêm khách hàng"
  el.querySelector("#addCustomerBtn").addEventListener("click", function () {
    const modal = createModal("Thêm khách hàng", null);

    modal.saveBtn.addEventListener("click", async function () {
      const name = modal.nameInput.value.trim();
      const email = modal.emailInput.value.trim();
      const phone = modal.phoneInput.value.trim();
      const tier = modal.tierSelect.value;

      if (!name || !email || !phone) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
      }

      try {
        const newCustomer = await httpRequest.post("customers", {
          name,
          email,
          phone,
          rank: tier.toUpperCase(),
        });

        renderCustomerRow(newCustomer);

        const totalEl = document.getElementById("totalCustomers");
        totalEl.textContent = parseInt(totalEl.textContent) + 1;

        modal.closeModal();
      } catch (error) {
        alert("Thêm khách hàng thất bại: " + error.message);
      }
    });
  });

  // Tìm kiếm theo tên / email
  function searchCustomer() {
    const keyword = el.querySelector("#search").value.toLowerCase();
    el.querySelectorAll("tbody tr").forEach((row) => {
      const name = row.querySelector("strong").textContent.toLowerCase();
      const email = row.children[1].childNodes[0].textContent.toLowerCase();
      row.style.display =
        name.includes(keyword) || email.includes(keyword) ? "" : "none";
    });
  }

  // Lọc theo hạng
  function filterByTier() {
    const tier = el.querySelector("#tierFilter").value;
    el.querySelectorAll("tbody tr").forEach((row) => {
      row.style.display =
        !tier || row.querySelector(`.tier.${tier}`) ? "" : "none";
    });
  }

  el.querySelector("#search").addEventListener("keyup", searchCustomer);
  el.querySelector("#tierFilter").addEventListener("change", filterByTier);

  initSidebar(el, router);

  // Fetch data và render
  async function loadData() {
    const [customers, orders] = await Promise.all([
      httpRequest.get("customers"),
      httpRequest.get("orders"),
    ]);

    const ordersByCustomer = {};
    for (const order of orders) {
      const cid = order.customer.id;
      if (!ordersByCustomer[cid]) ordersByCustomer[cid] = [];
      ordersByCustomer[cid].push(order);
    }

    const statsSection = el.querySelector("#statsSection");
    statsSection.innerHTML = "";
    statsSection.append(
      createStatCard("Tổng khách hàng", customers.length, "totalCustomers"),
      createStatCard("Khách hàng mới (Tháng)", 42),
      createStatCard("Tỉ lệ quay lại", "65%"),
    );

    el.querySelector("tbody").innerHTML = "";
    for (const customer of customers) {
      const myOrders = ordersByCustomer[customer.id] ?? [];
      const totalSpending = myOrders.reduce(
        (sum, o) => sum + o.amount * o.product.price,
        0,
      );
      renderCustomerRow(customer, myOrders.length, totalSpending);
    }
  }

  (async () => {
    try {
      await loadData();
    } catch (error) {
      await getNewAccessToken();
      await loadData();
    }
  })();
}
