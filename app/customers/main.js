import logout from "../../utils/logout.js";
import httpRequest from "../../utils/httpRequest.js";
import authGuard from "../../utils/authGuard.js";
import getNewAccessToken from "../../utils/getNewAccessToken.js";

authGuard();

const tierText = { gold: "VÀNG", silver: "BẠC", bronze: "ĐỒNG" };

// title: tiêu đề hiển thị ("Thêm khách hàng" hoặc "Sửa khách hàng")
// customer: null nếu thêm mới, object nếu sửa (để điền sẵn thông tin)
function createModal(title, customer) {
    // Tạo nền mờ bên ngoài
    const backdrop = document.createElement("div");
    backdrop.id = "modal";
    backdrop.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;

    // Tạo hộp modal bên trong
    const box = document.createElement("div");
    box.style.cssText = `
        background: white;
        padding: 32px 28px 24px;
        border-radius: 16px;
        width: 380px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    `;

    // Style chung cho input và select
    const fieldStyle = `
        width: 100%;
        padding: 10px 14px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 0.95rem;
        outline: none;
        transition: border-color 0.2s;
        box-sizing: border-box;
    `;

    // Tiêu đề
    const h3 = document.createElement("h3");
    h3.id = "modalTitle";
    h3.textContent = title;
    h3.style.cssText = `
        margin: 0 0 4px;
        font-size: 1.2rem;
        color: #2c3e50;
    `;

    // Đường kẻ phân cách dưới tiêu đề
    const divider = document.createElement("hr");
    divider.style.cssText =
        "border: none; border-top: 1px solid #eee; margin: 0;";

    // Các ô nhập liệu
    const nameInput = document.createElement("input");
    nameInput.id = "name";
    nameInput.placeholder = "Họ và tên";
    nameInput.value = customer ? customer.name : "";
    nameInput.style.cssText = fieldStyle;

    const emailInput = document.createElement("input");
    emailInput.id = "email";
    emailInput.type = "email";
    emailInput.placeholder = "Địa chỉ email";
    emailInput.value = customer ? customer.email : "";
    emailInput.style.cssText = fieldStyle;

    const phoneInput = document.createElement("input");
    phoneInput.id = "phone";
    phoneInput.placeholder = "Số điện thoại";
    phoneInput.value = customer ? customer.phone : "";
    phoneInput.style.cssText = fieldStyle;

    const tierSelect = document.createElement("select");
    tierSelect.id = "tier";
    tierSelect.style.cssText =
        fieldStyle + "cursor: pointer; background: white;";
    tierSelect.innerHTML = `
        <option value="gold">Hạng Vàng</option>
        <option value="silver">Hạng Bạc</option>
        <option value="bronze">Hạng Đồng</option>
    `;
    tierSelect.value = customer ? customer.rank.toLowerCase() : "gold";

    // Nhóm nút bấm
    const btnGroup = document.createElement("div");
    btnGroup.style.cssText = "display: flex; gap: 10px; margin-top: 4px;";

    // Nút Lưu
    const saveBtn = document.createElement("button");
    saveBtn.id = "saveCustomerBtn";
    saveBtn.textContent = "Lưu";
    saveBtn.style.cssText = `
        flex: 1;
        padding: 10px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
    `;

    // Nút Hủy
    const cancelBtn = document.createElement("button");
    cancelBtn.id = "cancelModalBtn";
    cancelBtn.textContent = "Hủy";
    cancelBtn.style.cssText = `
        flex: 1;
        padding: 10px;
        background: #f0f2f5;
        color: #555;
        border: none;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
    `;

    btnGroup.append(saveBtn, cancelBtn);

    // Hàm đóng modal: xóa backdrop khỏi trang
    function closeModal() {
        document.body.removeChild(backdrop);
    }

    // Bấm Hủy → đóng modal
    cancelBtn.addEventListener("click", closeModal);

    // Bấm ngoài backdrop → đóng modal
    backdrop.addEventListener("click", function (e) {
        if (e.target === backdrop) closeModal();
    });

    // Gắn các phần tử vào box, box vào backdrop, backdrop vào trang
    box.append(
        h3,
        divider,
        nameInput,
        emailInput,
        phoneInput,
        tierSelect,
        btnGroup,
    );
    backdrop.appendChild(box);
    document.body.appendChild(backdrop);

    // Trả về để hàm bên ngoài có thể đọc giá trị và đóng modal
    return {
        nameInput,
        emailInput,
        phoneInput,
        tierSelect,
        saveBtn,
        closeModal,
    };
}

function handleEditClick(tr) {
    // Đọc dữ liệu hiện tại từ hàng đang chọn
    const customer = {
        name: tr.querySelector("strong").textContent,
        email: tr.children[1].childNodes[0].textContent.trim(),
        phone: tr.children[1].querySelector("small").textContent,
        rank: tr.querySelector(".tier").classList[1],
    };

    // Tạo modal sửa, điền sẵn thông tin cũ
    const modal = createModal("Sửa khách hàng", customer);

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
            const updated = await httpRequest.put(
                `customers/${tr.dataset.id}`,
                {
                    name,
                    email,
                    phone,
                    rank: tier.toUpperCase(),
                },
            );

            // Cập nhật lại hàng trong bảng
            tr.querySelector(".avatar").textContent = updated.name
                .trim()
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase();
            tr.querySelector("strong").textContent = updated.name;
            tr.children[1].childNodes[0].textContent = updated.email;
            tr.children[1].querySelector("small").textContent = updated.phone;

            const tierSpan = tr.querySelector(".tier");
            const rankKey = updated.rank.toLowerCase();
            tierSpan.className = `tier ${rankKey}`;
            tierSpan.textContent = tierText[rankKey];

            modal.closeModal();
        } catch (error) {
            alert("Cập nhật thất bại: " + error.message);
        }
    });
}

// Tạo 1 thẻ card thống kê với tiêu đề và giá trị
// id: tùy chọn, dùng khi cần lấy lại element này sau bằng getElementById
function createStatCard(label, value, id = "") {
    const card = document.createElement("div");
    card.className = "card";

    const h3 = document.createElement("h3");
    h3.textContent = label;

    const p = document.createElement("p");
    p.textContent = value;
    if (id) p.id = id;

    card.append(h3, p);
    return card;
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

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-action";
    deleteBtn.title = "Xóa";
    deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
    deleteBtn.addEventListener("click", async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) return;

        try {
            await httpRequest.del(`customers/${tr.dataset.id}`);
            tr.remove();
        } catch (error) {
            alert("Xóa thất bại: " + error.message);
        }
    });

    const editBtn = document.createElement("button");
    editBtn.className = "btn-action";
    editBtn.title = "Sửa";
    editBtn.innerHTML = `<i class="fas fa-user-edit"></i>`;
    editBtn.addEventListener("click", () => handleEditClick(tr));

    tdAction.append(deleteBtn, editBtn);

    tr.append(tdInfo, tdContact, tdTier, tdOrders, tdSpending, tdAction);
    tbody.appendChild(tr);
}

document.addEventListener("DOMContentLoaded", () => {
    // Bấm "Thêm khách hàng" → tạo modal thêm mới
    document
        .getElementById("addCustomerBtn")
        .addEventListener("click", function () {
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

    function searchCustomer() {
        const keyword = document.getElementById("search").value.toLowerCase();
        const rows = document.querySelectorAll("tbody tr");
        rows.forEach((row) => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(keyword) ? "" : "none";
        });
    }

    function filterByTier() {
        const tier = document.getElementById("tierFilter").value;
        const rows = document.querySelectorAll("tbody tr");

        rows.forEach((row) => {
            if (!tier) {
                row.style.display = "";
            } else {
                const hasTier = row.querySelector(`.tier.${tier}`);
                row.style.display = hasTier ? "" : "none";
            }
        });
    }

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

    document
        .getElementById("tierFilter")
        .addEventListener("change", filterByTier);
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

        const statsSection = document.getElementById("statsSection");

        // Lấy được từ API
        const card1 = createStatCard(
            "Tổng khách hàng",
            customers.length,
            "totalCustomers",
        );

        // Chưa lấy được từ API, tạm để cứng
        const card2 = createStatCard("Khách hàng mới (Tháng)", 42);
        const card3 = createStatCard("Tỉ lệ quay lại", "65%");

        statsSection.append(card1, card2, card3);

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
        getNewAccessToken();
    }
});
