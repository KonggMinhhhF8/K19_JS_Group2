export function createModal(title, customer) {
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

    const h3 = document.createElement("h3");
    h3.id = "modalTitle";
    h3.textContent = title;
    h3.style.cssText = `
        margin: 0 0 4px;
        font-size: 1.2rem;
        color: #2c3e50;
    `;

    const divider = document.createElement("hr");
    divider.style.cssText =
        "border: none; border-top: 1px solid #eee; margin: 0;";

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

    const btnGroup = document.createElement("div");
    btnGroup.style.cssText = "display: flex; gap: 10px; margin-top: 4px;";

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

    function closeModal() {
        document.body.removeChild(backdrop);
    }

    cancelBtn.addEventListener("click", closeModal);

    backdrop.addEventListener("click", function (e) {
        if (e.target === backdrop) closeModal();
    });

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

    return {
        nameInput,
        emailInput,
        phoneInput,
        tierSelect,
        saveBtn,
        closeModal,
    };
}
