const API_URL = 'https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com';
let productsList = [];
let isEditMode = false;
let currentOrderId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Check if Edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    
    if (idParam) {
        isEditMode = true;
        currentOrderId = idParam;
        document.getElementById('page-title').textContent = 'Cập Nhật Đơn Hàng';
        document.getElementById('btnSubmit').textContent = 'Cập nhật';
    }

    // Fetch lists concurrently
    await Promise.all([
        fetchCustomers(),
        fetchProducts()
    ]);

    if (isEditMode) {
        await loadOrderData(currentOrderId);
    }

    // Add event listeners for total calculation
    document.getElementById('productSelect').addEventListener('change', calculateTotal);
    document.getElementById('quantity').addEventListener('input', calculateTotal);

    // Form submit
    document.getElementById('orderForm').addEventListener('submit', handleFormSubmit);
});

function getToken() {
    return localStorage.getItem('accessToken') || 'mock_token';
}

async function fetchCustomers() {
    try {
        const response = await fetchWithAuth('/customers');
        if (!response.ok) throw new Error('Failed to load customers');
        const customers = await response.json();
        
        const select = document.getElementById('customerSelect');
        customers.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = `${c.name} (${c.phone || c.email})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Lỗi khi tải danh sách khách hàng:', error);
    }
}

async function fetchProducts() {
    try {
        const response = await fetchWithAuth('/products');
        if (!response.ok) throw new Error('Failed to load products');
        productsList = await response.json();
        
        const select = document.getElementById('productSelect');
        productsList.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.name} - ${p.price.toLocaleString('vi-VN')}đ`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Lỗi khi tải danh sách sản phẩm:', error);
        productsList = [];
    }
}

async function loadOrderData(id) {
    try {
        // API doesn't have GET /orders/{id}, so we fetch all and find
        const response = await fetchWithAuth('/orders');
        if (!response.ok) throw new Error('Failed to load order');
        const orders = await response.json();
        const order = orders.find(o => o.id == id);
        
        if (!order) {
            alert('Không tìm thấy đơn hàng!');
            window.location.href = 'index.html';
            return;
        }

        // Pre-fill form
        document.getElementById('customerSelect').value = order.customer?.id || '';
        document.getElementById('productSelect').value = order.product?.id || '';
        document.getElementById('quantity').value = order.amount || 1;
        document.getElementById('statusSelect').value = order.status || 'pending';
        
        calculateTotal();

    } catch (error) {
        console.error('Lỗi khi tải thông tin đơn hàng:', error);
        alert('Không tìm thấy đơn hàng!');
        window.location.href = 'index.html';
    }
}

function calculateTotal() {
    const productId = document.getElementById('productSelect').value;
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    
    if (!productId) {
        document.getElementById('totalPrice').value = '0đ';
        return;
    }

    const product = productsList.find(p => p.id == productId);
    if (product) {
        const total = product.price * quantity;
        document.getElementById('totalPrice').value = total.toLocaleString('vi-VN') + 'đ';
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const customerId = document.getElementById('customerSelect').value;
    const productId = document.getElementById('productSelect').value;
    const amount = parseInt(document.getElementById('quantity').value) || 1;
    const status = document.getElementById('statusSelect').value;

    const payload = {
        customerId: parseInt(customerId),
        productId: parseInt(productId),
        amount: amount,
        status: status
    };

    try {
        const url = isEditMode ? `/orders/${currentOrderId}` : `/orders`;
        const method = isEditMode ? 'PUT' : 'POST';

        const response = await fetchWithAuth(url, {
            method: method,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert(isEditMode ? 'Cập nhật đơn hàng thành công!' : 'Tạo đơn hàng thành công!');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Lỗi khi lưu đơn hàng:', error);
        alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
}
