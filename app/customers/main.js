import logout from "../../utils/logout.js";
import httpRequest from "../../utils/httpRequest.js";

document.addEventListener("DOMContentLoaded", () => {
    function openModal() {
        document.getElementById("modal").style.display = "flex";
    }

    function closeModal() {
        document.getElementById("modal").style.display = "none";
    }

    function addCustomer() {
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const tier = document.getElementById("tier").value;

        if (!name || !email || !phone) {
            alert("Vui lòng nhập đầy đủ");
            return;
        }

        const initials = name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase();

        const tierText = {
            gold: "VÀNG",
            silver: "BẠC",
            bronze: "ĐỒNG",
        };

        if (editRow) {
            editRow.innerHTML = `
      <td>
        <div class="cust-info">
          <div class="avatar">${initials}</div>
          <div>
            <strong>${name}</strong><br>
            <small>ID: ${editRow.querySelector("small").innerText}</small>
          </div>
        </div>
      </td>
      <td>${email}<br><small>${phone}</small></td>
      <td><span class="tier ${tier}">${tierText[tier]}</span></td>
      <td>${editRow.children[3].innerText}</td>
      <td><strong>${editRow.children[4].innerText}</strong></td>
      <td>
        <button class="btn-action"><i class="fas fa-history"></i></button>
        <button class="btn-action" onclick="editCustomer(this)">
          <i class="fas fa-user-edit"></i>
        </button>
      </td>
    `;
            editRow = null;
        } else {
            const table = document.querySelector("tbody");

            const row = `
      <tr>
        <td>
          <div class="cust-info">
            <div class="avatar">${initials}</div>
            <div>
              <strong>${name}</strong><br>
              <small>ID: CUST-${Math.floor(Math.random() * 1000)}</small>
            </div>
          </div>
        </td>
        <td>${email}<br><small>${phone}</small></td>
        <td><span class="tier ${tier}">${tierText[tier]}</span></td>
        <td>0</td>
        <td><strong>0đ</strong></td>
        <td>
          <button class="btn-action"><i class="fas fa-history"></i></button>
          <button class="btn-action" onclick="editCustomer(this)">
            <i class="fas fa-user-edit"></i>
          </button>
        </td>
      </tr>
    `;
            table.innerHTML += row;
        }

        closeModal();
    }

    let editRow = null;
    function editCustomer(btn) {
        editRow = btn.closest("tr");

        const name = editRow.querySelector("strong").innerText;
        const email = editRow.children[1].childNodes[0].textContent.trim();
        const phone = editRow.children[1].querySelector("small").innerText;
        const tier = editRow.querySelector(".tier").classList[1];

        document.getElementById("name").value = name;
        document.getElementById("email").value = email;
        document.getElementById("phone").value = phone;
        document.getElementById("tier").value = tier;
        openModal();
    }

    function searchCustomer() {
        const keyword = document.getElementById("search").value.toLowerCase();
        const rows = document.querySelectorAll("tbody tr");

        rows.forEach((row) => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(keyword) ? "" : "none";
        });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", logout);
});

document.addEventListener("DOMContentLoaded", async () => {
    const customers = await httpRequest.get("/customers");

    console.log(customers);

    const totalCustomers = document.getElementById("totalCustomers");
    totalCustomers.innerText = `${customers.length}`;

    for (const customer of customers) {
        console.log(customer);
    }
});
