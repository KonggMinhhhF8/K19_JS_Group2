import httpRequest from "../../utils/httpRequest.js";
import { createModal } from "./modal.js";

const tierText = { gold: "VÀNG", silver: "BẠC", bronze: "ĐỒNG" };

export function createStatCard(label, value, id = "") {
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

export function handleEditClick(tr) {
    const customer = {
        name: tr.querySelector("strong").textContent,
        email: tr.children[1].childNodes[0].textContent.trim(),
        phone: tr.children[1].querySelector("small").textContent,
        rank: tr.querySelector(".tier").classList[1],
    };

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
                { name, email, phone, rank: tier.toUpperCase() },
            );

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

export function renderCustomerRow(customer, orderCount = 0, totalSpending = 0) {
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
