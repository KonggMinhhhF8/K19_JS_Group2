import {
    productPageStyles,
    renderProductListPage,
    renderProductFormPage,
} from "./templates.js";
import { initSidebar } from "../shared/sidebar.js";
import { router } from "../router.js";

const API_BASE = "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com";

function getAccessToken() {
    return (
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        ""
    );
}

function formatCurrency(value) {
    const number = Number(value || 0);
    return new Intl.NumberFormat("vi-VN").format(number) + "đ";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function getImageUrl(product) {
    return (
        product?.imageUrl ||
        `https://picsum.photos/seed/product-${product?.id || "default"}/80/80`
    );
}

async function apiRequest(path, options = {}) {
    const token = getAccessToken();
    const headers = { ...(options.headers || {}) };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (options.body !== undefined && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        body:
            options.body instanceof FormData
                ? options.body
                : options.body !== undefined
                  ? JSON.stringify(options.body)
                  : undefined,
    });

    if (!response.ok) {
        let message = `Request failed with status ${response.status}`;
        try {
            const errorBody = await response.json();
            message = errorBody?.message || errorBody?.error || message;
        } catch {
            const text = await response.text();
            if (text) {
                message = text;
            }
        }
        throw new Error(message);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return response.json();
    }

    return null;
}

function showInlineMessage(element, message, isError = false) {
    if (!element) return;
    element.textContent = message;
    element.style.color = isError ? "#e74c3c" : "#576574";
}

function getQueryId() {
    const params = new URLSearchParams(window.location.search);
    const searchId = params.get("id");
    if (searchId) return searchId;
    const hashQuery = window.location.hash.split("?")[1] || "";
    return new URLSearchParams(hashQuery).get("id");
}

function ensureStyles() {
    if (!document.getElementById("product-page-styles")) {
        const style = document.createElement("style");
        style.id = "product-page-styles";
        style.textContent = productPageStyles;
        document.head.appendChild(style);
    }
}

// --- Product List logic (mostly unchanged) ---
function createListController(root) {
    const tableBody = root.querySelector("#productTableBody");
    const searchInput = root.querySelector("#searchInput");
    const categoryFilter = root.querySelector("#categoryFilter");
    const totalProductsEl = root.querySelector("#totalProducts");
    const lowStockProductsEl = root.querySelector("#lowStockProducts");
    const totalCategoriesEl = root.querySelector("#totalCategories");
    const addProductBtn = root.querySelector(".btn-add");
    const deleteModal = root.querySelector("#deleteProductModal");
    const deleteMessage = root.querySelector("#deleteProductMessage");
    const cancelDeleteBtn = root.querySelector("#cancelDeleteBtn");
    const confirmDeleteBtn = root.querySelector("#confirmDeleteBtn");

    if (!tableBody || !searchInput || !categoryFilter) return null;

    const state = {
        products: [],
        categories: [],
        search: "",
        categoryId: "",
        deleteTarget: null,
    };

    function renderStats() {
        const totalProducts = state.products.length;
        const lowStockProducts = state.products.filter(
            (p) => Number(p.remaining || 0) <= 10,
        ).length;
        totalProductsEl.textContent = totalProducts;
        lowStockProductsEl.textContent = lowStockProducts;
        totalCategoriesEl.textContent = state.categories.length;
    }

    function renderCategoryFilter() {
        const currentValue = categoryFilter.value;
        categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>';
        state.categories.forEach((c) => {
            const option = document.createElement("option");
            option.value = String(c.id);
            option.textContent = c.name;
            categoryFilter.appendChild(option);
        });
        if (currentValue) categoryFilter.value = currentValue;
    }

    function getFilteredProducts() {
        const keyword = state.search.trim().toLowerCase();
        return state.products.filter((product) => {
            const matchesKeyword =
                !keyword ||
                [product.name, product.sku]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(keyword));
            const matchesCategory =
                !state.categoryId ||
                String(product.category?.id || product.categoryId || "") ===
                    state.categoryId;
            return matchesKeyword && matchesCategory;
        });
    }

    function renderEmptyState(message, description) {
        tableBody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><h4>${escapeHtml(message)}</h4><p>${escapeHtml(description)}</p></div></td></tr>`;
    }

    function renderProducts() {
        const products = getFilteredProducts();
        if (!products.length) {
            renderEmptyState(
                "Không có sản phẩm phù hợp",
                "Hãy thử đổi từ khóa tìm kiếm hoặc bộ lọc danh mục.",
            );
            return;
        }
        tableBody.innerHTML = products
            .map((product) => {
                const remaining = Number(product.remaining || 0);
                const isLowStock = remaining <= 10;
                const stockLabel = isLowStock
                    ? `<span class="badge badge-warning">${remaining} - Cảnh báo</span>`
                    : `<span class="badge badge-success">${remaining}</span>`;
                return `
        <tr>
          <td><img src="${escapeHtml(getImageUrl(product))}" alt="${escapeHtml(product.name)}" class="img-thumb"></td>
          <td><strong>${escapeHtml(product.name || "")}</strong><br><small>SKU: ${escapeHtml(product.sku || "-")}</small></td>
          <td>${escapeHtml(product.category?.name || "-")}</td>
          <td>${formatCurrency(product.price)}</td>
          <td>${stockLabel}</td>
          <td>
            <button class="btn-icon edit" type="button" data-edit-id="${product.id}"><i class="fas fa-edit"></i></button>
            <button class="btn-icon delete" type="button" data-delete-id="${product.id}"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `;
            })
            .join("");
    }

    function openDeleteModal(product) {
        state.deleteTarget = product;
        deleteMessage.textContent = `Bạn có chắc chắn muốn xóa sản phẩm ${product.name} không?`;
        deleteModal.style.display = "flex";
        deleteModal.setAttribute("aria-hidden", "false");
    }

    function closeDeleteModal() {
        state.deleteTarget = null;
        deleteModal.style.display = "none";
        deleteModal.setAttribute("aria-hidden", "true");
    }

    async function loadData() {
        try {
            renderEmptyState(
                "Đang tải dữ liệu...",
                "Vui lòng chờ trong giây lát.",
            );
            const [categories, products] = await Promise.all([
                apiRequest("/categories"),
                apiRequest("/products"),
            ]);
            state.categories = Array.isArray(categories) ? categories : [];
            state.products = Array.isArray(products) ? products : [];
            renderStats();
            renderCategoryFilter();
            renderProducts();
        } catch (err) {
            renderEmptyState(
                "Không tải được dữ liệu",
                err.message || "Vui lòng kiểm tra token hoặc API.",
            );
        }
    }

    tableBody.addEventListener("click", (event) => {
        const editButton = event.target.closest("[data-edit-id]");
        const deleteButton = event.target.closest("[data-delete-id]");
        if (editButton) {
            const productId = editButton.getAttribute("data-edit-id");
            window.location.hash = `#/products/create?id=${encodeURIComponent(productId)}`;
            return;
        }
        if (deleteButton) {
            const productId = deleteButton.getAttribute("data-delete-id");
            const product = state.products.find(
                (p) => String(p.id) === String(productId),
            );
            if (product) openDeleteModal(product);
        }
    });

    searchInput.addEventListener("input", (e) => {
        state.search = e.target.value;
        renderProducts();
    });
    categoryFilter.addEventListener("change", (e) => {
        state.categoryId = e.target.value;
        renderProducts();
    });
    if (addProductBtn)
        addProductBtn.addEventListener("click", () => {
            window.location.hash = "#/products/create";
        });
    cancelDeleteBtn.addEventListener("click", closeDeleteModal);
    deleteModal.addEventListener("click", (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });
    confirmDeleteBtn.addEventListener("click", async () => {
        if (!state.deleteTarget) return;
        try {
            await apiRequest(`/products/${state.deleteTarget.id}`, {
                method: "DELETE",
            });
            closeDeleteModal();
            await loadData();
        } catch (err) {
            alert(err.message || "Xóa sản phẩm thất bại.");
        }
    });

    loadData();

    return { refresh: loadData };
}

// --- Product Form logic ---
function createFormController(root) {
    const form = root.querySelector("#productForm");
    const pageTitle = root.querySelector("#pageTitle");
    const pageSubtitle = root.querySelector("#pageSubtitle");
    const formStatus = root.querySelector("#formStatus");
    const categorySelect = root.querySelector("#categoryId");
    const cancelBtn = root.querySelector("#cancelBtn");
    const saveBtn = root.querySelector("#saveBtn");
    if (!form || !categorySelect) return null;

    const productId = getQueryId();
    const fields = {
        name: root.querySelector("#name"),
        sku: root.querySelector("#sku"),
        price: root.querySelector("#price"),
        remaining: root.querySelector("#remaining"),
        imageId: root.querySelector("#imageId"),
        description: root.querySelector("#description"),
    };

    function setStatus(message, isError = false) {
        showInlineMessage(formStatus, message, isError);
    }
    function setMode(isEdit) {
        if (isEdit) {
            pageTitle.textContent = "Chỉnh sửa sản phẩm";
            pageSubtitle.textContent =
                "Dữ liệu sẽ được tự động điền từ API và lưu bằng PUT.";
            saveBtn.textContent = "Lưu thay đổi";
            return;
        }
        pageTitle.textContent = "Thêm sản phẩm mới";
        pageSubtitle.textContent = "Điền thông tin sản phẩm và lưu để tạo mới.";
        saveBtn.textContent = "Lưu sản phẩm";
    }

    function populateCategories(categories) {
        categorySelect.innerHTML = '<option value="">Chọn danh mục</option>';
        categories.forEach((c) => {
            const option = document.createElement("option");
            option.value = String(c.id);
            option.textContent = c.name;
            categorySelect.appendChild(option);
        });
    }
    function fillForm(product) {
        fields.name.value = product?.name || "";
        fields.sku.value = product?.sku || "";
        fields.price.value = product?.price ?? "";
        fields.remaining.value = product?.remaining ?? "";
        fields.imageId.value = product?.imageUrl || "";
        const categoryId = product?.category?.id || product?.categoryId || "";
        if (categoryId) categorySelect.value = String(categoryId);
    }

    async function loadFormData() {
        try {
            setStatus("Đang tải danh mục...", false);
            const categories = await apiRequest("/categories");
            populateCategories(Array.isArray(categories) ? categories : []);
            if (productId) {
                setMode(true);
                setStatus(`Đang tải dữ liệu sản phẩm #${productId}...`, false);
                const product = await apiRequest(`/products/${productId}`);
                fillForm(product);
                setStatus(`Đang chỉnh sửa sản phẩm ${product.name}.`, false);
            } else {
                setMode(false);
                setStatus("Sẵn sàng tạo sản phẩm mới.", false);
            }
        } catch (err) {
            setStatus(err.message || "Không tải được dữ liệu.", true);
        }
    }

    if (cancelBtn)
        cancelBtn.addEventListener("click", () => {
            window.location.hash = "#/products";
        });
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            categoryId: Number(categorySelect.value),
            name: fields.name.value.trim(),
            sku: fields.sku.value.trim() || null,
            price: Number(fields.price.value),
            remaining: Number(fields.remaining.value),
            imageId: fields.imageId.value.trim() || null,
        };
        if (!payload.categoryId) {
            setStatus("Vui lòng chọn danh mục.", true);
            return;
        }
        if (!payload.name) {
            setStatus("Vui lòng nhập tên sản phẩm.", true);
            return;
        }
        if (Number.isNaN(payload.price) || Number.isNaN(payload.remaining)) {
            setStatus("Giá bán và số lượng tồn kho phải là số hợp lệ.", true);
            return;
        }
        try {
            saveBtn.disabled = true;
            setStatus(
                productId ? "Đang lưu thay đổi..." : "Đang tạo sản phẩm...",
                false,
            );
            if (productId) {
                await apiRequest(`/products/${productId}`, {
                    method: "PUT",
                    body: payload,
                });
            } else {
                await apiRequest("/products", {
                    method: "POST",
                    body: payload,
                });
            }
            window.location.hash = "#/products";
        } catch (err) {
            setStatus(err.message || "Không lưu được sản phẩm.", true);
        } finally {
            saveBtn.disabled = false;
        }
    });

    loadFormData();
    return { loadFormData };
}

export function mountProductListPage(rootEl) {
    ensureStyles();
    rootEl.innerHTML = renderProductListPage();
    initSidebar(rootEl, router);
    createListController(rootEl);
}

export function mountProductFormPage(rootEl) {
    ensureStyles();
    rootEl.innerHTML = renderProductFormPage();
    initSidebar(rootEl, router);
    createFormController(rootEl);
}

// Backwards compatibility when module is loaded directly in browser
if (
    typeof window !== "undefined" &&
    window.location.pathname.includes("/app/products/")
) {
    ensureStyles();
    if (window.location.pathname.endsWith("index.html")) {
        document.body.innerHTML = renderProductListPage();
        createListController(document);
    }
    if (window.location.pathname.endsWith("create.html")) {
        document.body.innerHTML = renderProductFormPage();
        createFormController(document);
    }
}
