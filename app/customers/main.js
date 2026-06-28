import logout from "../../utils/logout.js";
import httpRequest from "../../utils/httpRequest.js";
import authGuard from "../../utils/authGuard.js";

authGuard();

const tierText = { gold: "VÀNG", silver: "BẠC", bronze: "ĐỒNG" };
let editRow = null;

function handleEditClick(tr) {
    editRow = tr;

    const name = tr.querySelector("strong").textContent;
    const email = tr.children[1].childNodes[0].textContent.trim();
    const phone = tr.children[1].querySelector("small").textContent;
    const tier = tr.querySelector(".tier").classList[1];

    document.getElementById("name").value = name;
    document.getElementById("email").value = email;
    document.getElementById("phone").value = phone;
    document.getElementById("tier").value = tier;

    document.getElementById("modal").style.display = "flex";
}

function renderCustomerRow(customer, orderCount = 0, totalSpending = 0) {
    const tbody = document.querySelector("tbody");
    const tr = document.createElement("tr");
    tr.dataset.id = customer.id;

    // Cột 1: Avatar + Tên
    const tdInfo = document.createElement("td");
    const custInfo = document.createElement("div");
    custInfo.className = "cust-info";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = customer.name
        .trim()
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase();

    const nameWrapper = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = customer.name;
    const small = document.createElement("small");
    small.textContent = `ID: ${customer.id}`;
    nameWrapper.append(strong, document.createElement("br"), small);
    custInfo.append(avatar, nameWrapper);
    tdInfo.appendChild(custInfo);

    // Cột 2: Email + SĐT
    const tdContact = document.createElement("td");
    tdContact.textContent = customer.email;
    const smallPhone = document.createElement("small");
    smallPhone.textContent = customer.phone;
    tdContact.append(document.createElement("br"), smallPhone);

    // Cột 3: Hạng
    const tdTier = document.createElement("td");
    const tierSpan = document.createElement("span");
    const rankKey = (customer.rank ?? "bronze").toLowerCase();
    tierSpan.className = `tier ${rankKey}`;
    tierSpan.textContent = tierText[rankKey];
    tdTier.appendChild(tierSpan);

    // Cột 4: Số đơn hàng
    const tdOrders = document.createElement("td");
    tdOrders.textContent = orderCount;

    // Cột 5: Tổng chi tiêu
    const tdSpending = document.createElement("td");
    const boldSpending = document.createElement("strong");
    boldSpending.textContent = totalSpending.toLocaleString("vi-VN") + "đ";
    tdSpending.appendChild(boldSpending);

    // Cột 6: Thao tác
    const tdAction = document.createElement("td");

    const historyBtn = document.createElement("button");
    historyBtn.className = "btn-action";
    historyBtn.title = "Lịch sử mua hàng";
    historyBtn.innerHTML = `<i class="fas fa-history"></i>`;

    const editBtn = document.createElement("button");
    editBtn.className = "btn-action";
    editBtn.title = "Sửa";
    editBtn.innerHTML = `<i class="fas fa-user-edit"></i>`;
    editBtn.addEventListener("click", () => handleEditClick(tr));

    tdAction.append(historyBtn, editBtn);

    tr.append(tdInfo, tdContact, tdTier, tdOrders, tdSpending, tdAction);
    tbody.appendChild(tr);
}

document.addEventListener("DOMContentLoaded", () => {
    function openModal() {
        document.getElementById("modal").style.display = "flex";
    }

    function closeModal() {
        editRow = null;
        document.getElementById("modal").style.display = "none";
    }

    async function addCustomer() {
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const tier = document.getElementById("tier").value;

        if (!name || !email || !phone) {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        try {
            if (editRow) {
                const customerId = editRow.dataset.id;
                const updated = await httpRequest.put(`customers/${customerId}`, {
                    name,
                    email,
                    phone,
                    rank: tier.toUpperCase(),
                });

                editRow.querySelector(".avatar").textContent = updated.name
                    .trim()
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase();
                editRow.querySelector("strong").textContent = updated.name;

                const contact = editRow.children[1];
                contact.childNodes[0].textContent = updated.email;
                contact.querySelector("small").textContent = updated.phone;

                const tierSpan = editRow.querySelector(".tier");
                const rankKey = updated.rank.toLowerCase();
                tierSpan.className = `tier ${rankKey}`;
                tierSpan.textContent = tierText[rankKey];
            } else {
                const newCustomer = await httpRequest.post("customers", {
                    name,
                    email,
                    phone,
                    rank: tier.toUpperCase(),
                });

                renderCustomerRow(newCustomer);

                const totalEl = document.getElementById("totalCustomers");
                totalEl.textContent = parseInt(totalEl.textContent) + 1;
            }

            closeModal();
        } catch (error) {
            alert("Thao tác thất bại: " + error.message);
        }
    }

    function searchCustomer() {
        const keyword = document.getElementById("search").value.toLowerCase();
        const rows = document.querySelectorAll("tbody tr");
        rows.forEach((row) => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(keyword) ? "" : "none";
        });
    }

    document.getElementById("addCustomerBtn").addEventListener("click", openModal);
    document.getElementById("saveCustomerBtn").addEventListener("click", addCustomer);
    document.getElementById("cancelModalBtn").addEventListener("click", closeModal);
    document.getElementById("search").addEventListener("keyup", searchCustomer);

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    function toggleMenu() {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    }

    menuToggle.addEventListener("click", toggleMenu);
    overlay.addEventListener("click", toggleMenu);

    document.getElementById("logoutBtn").addEventListener("click", logout);
});

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const [customers, orders] = await Promise.all([
            httpRequest.get("customers"),
            httpRequest.get("orders"),
        ]);

        const ordersByCustomer = {};
        for (const order of orders) {
            const cid = order.customer.id;
            if (!ordersByCustomer[cid]) {
                ordersByCustomer[cid] = [];
            }
            ordersByCustomer[cid].push(order);
        }

        document.getElementById("totalCustomers").innerText = customers.length;

        for (const customer of customers) {
            const myOrders = ordersByCustomer[customer.id] ?? [];
            const orderCount = myOrders.length;
            const totalSpending = myOrders.reduce(
                (sum, o) => sum + o.amount * o.product.price,
                0,
            );
            renderCustomerRow(customer, orderCount, totalSpending);
        }
    } catch (error) {
        alert("Không thể tải dữ liệu: " + error.message);
    }
});
