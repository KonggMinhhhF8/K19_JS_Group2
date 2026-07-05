const NAV_ITEMS = [
  { key: "home", href: "#/home", icon: "fa-home", label: "Tổng quan" },
  { key: "products", href: "#/products", icon: "fa-box", label: "Sản phẩm" },
  { key: "orders", href: "#/orders", icon: "fa-shopping-cart", label: "Đơn hàng" },
  { key: "customers", href: "#/customers", icon: "fa-users", label: "Khách hàng" },
  { key: "reports", href: "#/reports", icon: "fa-chart-line", label: "Báo cáo" },
];

export function renderSidebarHTML(activePage) {
  const itemsHTML = NAV_ITEMS.map(
    (item) => `
          <li class="${item.key === activePage ? "active" : ""}">
            <a href="${item.href}"><i class="fas ${item.icon}"></i> ${item.label}</a>
          </li>`,
  ).join("");

  return `
        <aside class="sidebar" id="sidebar">
            <h2>ShopAdmin</h2>
            <ul>${itemsHTML}
            </ul>
            <button class="logout-btn" id="logoutBtn">
                <i class="fas fa-sign-out-alt"></i> Đăng xuất
            </button>
        </aside>`;
}

export function initSidebar(el, router) {
  const sidebar = el.querySelector("#sidebar");
  const overlay = el.querySelector("#overlay");
  const menuToggle = el.querySelector("#menuToggle");

  if (sidebar && overlay && menuToggle) {
    const toggleMenu = () => {
      sidebar.classList.toggle("active");
      overlay.classList.toggle("active");
    };
    menuToggle.addEventListener("click", toggleMenu);
    overlay.addEventListener("click", toggleMenu);
  }

  const logoutBtn = el.querySelector("#logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      router.navigate("/login");
    });
  }
}
