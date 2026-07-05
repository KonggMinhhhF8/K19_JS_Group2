export const productPageStyles = `
:root {
  --primary-color: #3498db;
  --dark-color: #2c3e50;
  --bg-color: #f4f7f6;
  --success: #27ae60;
  --border: #dcdde1;
  --muted: #7f8c8d;
  --warning: #f39c12;
  --danger: #e74c3c;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Segoe UI", sans-serif;
}

html,
body {
  min-height: 100%;
}

body {
  background-color: var(--bg-color);
  color: var(--dark-color);
}

a {
  color: inherit;
}

.container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background: var(--dark-color);
  color: white;
  padding: 25px;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
}

.sidebar h2 {
  margin-bottom: 40px;
  text-align: center;
  color: var(--primary-color);
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 15px;
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 5px;
  color: #ecf0f1;
  transition: 0.3s;
}

.sidebar a {
  display: block;
  text-decoration: none;
  color: inherit;
}

.sidebar li:hover,
.sidebar li.active {
  background: #34495e;
  color: var(--primary-color);
}

.sidebar i {
  width: 20px;
  margin-right: 12px;
}

.main-content {
  flex: 1;
  padding: 40px;
  min-width: 0;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  gap: 16px;
  flex-wrap: wrap;
}

.search-bar input {
  padding: 10px 20px;
  width: 350px;
  border: 1px solid #ddd;
  border-radius: 25px;
  outline: none;
}

.user-actions .btn-add {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-add {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.card,
.table-container,
.form-status,
.status-box {
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.card {
  padding: 25px;
  border-radius: 12px;
}

.card h3,
.table-header h3,
.status-box h3 {
  margin-bottom: 10px;
  font-size: 0.85rem;
  color: var(--muted);
  text-transform: uppercase;
}

.card p {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--dark-color);
}

.table-container {
  padding: 25px;
  border-radius: 12px;
  overflow-x: auto;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
}

.filters {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filters select {
  min-width: 220px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fff;
  color: var(--dark-color);
  font-size: 14px;
  outline: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filters select:hover {
  border-color: #b2bec3;
}

.filters select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.12);
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 650px;
}

th {
  text-align: left;
  padding: 15px;
  background: #f8f9fa;
  color: #666;
  font-size: 0.9rem;
}

td {
  padding: 15px;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
  vertical-align: middle;
}

.img-thumb {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

.btn-icon {
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  background: #f0f2f5;
  color: #4b5563;
  cursor: pointer;
  margin-right: 6px;
}

.btn-icon.edit:hover {
  background: #e8f3ff;
  color: var(--primary-color);
}

.btn-icon.delete:hover {
  background: #ffecec;
  color: var(--danger);
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.badge-success {
  background: #eafaf1;
  color: #1e8449;
}

.badge-warning {
  background: #fef5e7;
  color: #b9770e;
}

.empty-state {
  padding: 28px 16px;
  text-align: center;
  color: #7f8c8d;
}

.empty-state h4 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
  backdrop-filter: blur(4px);
}

.modal-content {
  width: min(460px, calc(100% - 32px));
  padding: 26px 26px 22px;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.22);
  border: 1px solid rgba(226, 232, 240, 0.95);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-content h3 {
  margin: 0;
  font-size: 1.18rem;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-content h3::before {
  content: "!";
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 1rem;
  font-weight: 800;
  flex: 0 0 30px;
}

.modal-content p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
  font-size: 0.96rem;
  padding-left: 40px;
  max-width: 100%;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.btn-secondary {
  background: #eef2f7;
  color: #475569;
  border: none;
  padding: 11px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  min-width: 92px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.btn-secondary:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: white;
  border: none;
  padding: 11px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  min-width: 92px;
  box-shadow: 0 8px 18px rgba(220, 38, 38, 0.22);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    filter 0.15s ease;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(185, 28, 28, 0.28);
  filter: brightness(1.02);
}

.page-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  background: white;
  padding: 18px 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.page-top h1 {
  font-size: 1.4rem;
  color: var(--dark-color);
}

.page-top p {
  color: #7f8c8d;
  margin-top: 4px;
}

.back-link {
  text-decoration: none;
  color: #7f8c8d;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.form-status {
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  color: #576574;
}

.form-status strong {
  color: var(--dark-color);
}

.form-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  gap: 20px;
}

.form-layout > div {
  min-width: 0;
}

.form-layout .card {
  margin-bottom: 20px;
}

.field-grid {
  display: grid;
  gap: 16px;
}

.field-grid.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field-group {
  margin-bottom: 18px;
}

.field-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}

.field-group input,
.field-group select,
.field-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  transition: 0.3s;
}

.field-group input:focus,
.field-group select:focus,
.field-group textarea:focus {
  border-color: var(--primary-color);
}

.helper-line {
  color: #7f8c8d;
  font-size: 0.85rem;
  margin-top: 6px;
}

.status-box {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: fit-content;
}

.status-box h3 {
  margin-bottom: 14px;
  font-size: 1.05rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.status-list {
  display: grid;
  gap: 10px;
  color: #576574;
}

.status-list strong {
  color: var(--dark-color);
}

.form-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 12px;
}

.btn {
  padding: 12px 25px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.btn-save {
  background: var(--success);
  color: white;
}

.btn-cancel {
  background: #eee;
  color: #7f8c8d;
}

@media (max-width: 992px) {
  .container {
    display: block;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: static;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .search-bar input {
    width: 100%;
  }

  .field-grid.two-col {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .main-content {
    padding: 18px;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .modal-buttons,
  .form-footer {
    flex-direction: column-reverse;
  }

  .btn-secondary,
  .btn-danger,
  .btn {
    width: 100%;
  }
}
`;

export function renderProductListPage() {
  return `
    <div class="container">
      <aside class="sidebar">
        <h2>ShopAdmin</h2>
        <ul>
          <li><a href="#/home"><i class="fas fa-home"></i> Tổng quan</a></li>
          <li class="active"><a href="#/products"><i class="fas fa-box"></i> Sản phẩm</a></li>
          <li><a href="#/orders"><i class="fas fa-shopping-cart"></i> Đơn hàng</a></li>
          <li><a href="#/customers"><i class="fas fa-users"></i> Khách hàng</a></li>
          <li><a href="#/reports"><i class="fas fa-chart-line"></i> Báo cáo</a></li>
        </ul>
      </aside>

      <main class="main-content">
        <header>
          <div class="search-bar">
            <input
              type="text"
              id="searchInput"
              placeholder="Tìm tên sản phẩm, mã SKU..."
            />
          </div>
          <div class="user-actions">
            <a class="btn-add" href="#/products/create">
              <i class="fas fa-plus"></i> Thêm sản phẩm
            </a>
          </div>
        </header>

        <section class="stats">
          <div class="card">
            <h3>Tổng sản phẩm</h3>
            <p id="totalProducts">0</p>
          </div>
          <div class="card">
            <h3>Sắp hết hàng</h3>
            <p id="lowStockProducts" style="color: #e74c3c">0</p>
          </div>
          <div class="card">
            <h3>Danh mục</h3>
            <p id="totalCategories">0</p>
          </div>
        </section>

        <section class="table-container">
          <div class="table-header">
            <h3>Danh sách sản phẩm</h3>
            <div class="filters">
              <select id="categoryFilter">
                <option value="">Tất cả danh mục</option>
              </select>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Hình</th>
                <th>Thông tin sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody id="productTableBody">
              <tr>
                <td colspan="6">
                  <div class="empty-state">
                    <h4>Đang tải dữ liệu sản phẩm</h4>
                    <p>Vui lòng chờ trong giây lát.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>

    <div id="deleteProductModal" class="modal">
      <div class="modal-content">
        <h3>Xác nhận xóa sản phẩm</h3>
        <p id="deleteProductMessage">Bạn có chắc chắn muốn xóa sản phẩm này không?</p>
        <div class="modal-buttons">
          <button type="button" class="btn-secondary" id="cancelDeleteBtn">Hủy bỏ</button>
          <button type="button" class="btn-danger" id="confirmDeleteBtn">Xóa</button>
        </div>
      </div>
    </div>
  `;
}

export function renderProductFormPage() {
  return `
    <div class="container">
      <aside class="sidebar">
        <h2>ShopAdmin</h2>
        <ul>
          <li><a href="#/home"><i class="fas fa-home"></i> Tổng quan</a></li>
          <li class="active"><a href="#/products"><i class="fas fa-box"></i> Sản phẩm</a></li>
          <li><a href="#/orders"><i class="fas fa-shopping-cart"></i> Đơn hàng</a></li>
          <li><a href="#/customers"><i class="fas fa-users"></i> Khách hàng</a></li>
          <li><a href="#/reports"><i class="fas fa-chart-line"></i> Báo cáo</a></li>
        </ul>
      </aside>

      <main class="main-content">
        <div class="page-top">
          <div>
            <a href="#/products" class="back-link">
              <i class="fas fa-arrow-left"></i> Quay lại danh sách
            </a>
            <h1 id="pageTitle">Thêm sản phẩm mới</h1>
            <p id="pageSubtitle">Điền thông tin sản phẩm và lưu để tạo mới.</p>
          </div>
          <div class="form-status">
            <strong>API:</strong> /products và /categories
          </div>
        </div>

        <div class="form-status" id="formStatus">
          Đang tải danh mục và dữ liệu sản phẩm...
        </div>

        <form id="productForm">
          <div class="form-layout">
            <div>
              <div class="card">
                <h3>Thông tin chung</h3>
                <div class="field-grid">
                  <div class="field-group">
                    <label for="name">Tên sản phẩm</label>
                    <input id="name" name="name" type="text" placeholder="Ví dụ: iPhone 15 Pro Max" required />
                  </div>
                  <div class="field-group">
                    <label for="sku">Mã SKU</label>
                    <input id="sku" name="sku" type="text" placeholder="Ví dụ: IP15PM-BLUE-256" />
                  </div>
                  <div class="field-group">
                    <label for="categoryId">Danh mục</label>
                    <select id="categoryId" name="categoryId" required>
                      <option value="">Đang tải danh mục...</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="card">
                <h3>Giá cả & Kho hàng</h3>
                <div class="field-grid two-col">
                  <div class="field-group">
                    <label for="price">Giá bán (VNĐ)</label>
                    <input id="price" name="price" type="number" min="0" step="1" placeholder="32500000" required />
                  </div>
                  <div class="field-group">
                    <label for="remaining">Số lượng tồn kho</label>
                    <input id="remaining" name="remaining" type="number" min="0" step="1" placeholder="45" required />
                  </div>
                </div>
                <div class="field-group">
                  <label for="imageId">Hình ảnh</label>
                  <input id="imageId" name="imageId" type="text" placeholder="URL ảnh hoặc mã ảnh, có thể để trống" />
                  <div class="helper-line">API cho phép để trống nếu chưa có ảnh.</div>
                </div>
                <div class="field-group">
                  <label for="description">Mô tả sản phẩm</label>
                  <textarea id="description" name="description" rows="5" placeholder="Có thể để trống nếu chưa cần nhập..."></textarea>
                  <div class="helper-line">Trường mô tả không nằm trong request sản phẩm hiện tại, có thể bỏ qua khi lưu.</div>
                </div>
              </div>
            </div>

            <aside class="status-box">
              <h3>Ghi chú</h3>
              <div class="status-list">
                <div><strong>Create:</strong> gửi POST /products</div>
                <div><strong>Edit:</strong> gửi PUT /products/{id}</div>
                <div><strong>Danh mục:</strong> lấy từ GET /categories</div>
                <div><strong>Image:</strong> có thể để null hoặc chuỗi rỗng</div>
              </div>
            </aside>
          </div>

          <div class="form-footer">
            <button type="button" class="btn btn-cancel" id="cancelBtn">Hủy bỏ</button>
            <button type="submit" class="btn btn-save" id="saveBtn">Lưu sản phẩm</button>
          </div>
        </form>
      </main>
    </div>
  `;
}
