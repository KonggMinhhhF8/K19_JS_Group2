import authGuard from "../../utils/authGuard.js";
import httpRequest from "../../utils/httpRequest.js";

// Run authentication guard
if (!authGuard()) {
    throw new Error("Authentication required");
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        alert('Không tìm thấy mã đơn hàng');
        window.location.href = 'index.html';
        return;
    }

    await loadOrderDetails(orderId);
    
    document.getElementById('btn-edit-order').addEventListener('click', () => {
        window.location.href = `order-form.html?id=${orderId}`;
    });
});

async function loadOrderDetails(id) {
    try {
        // Fetch all orders and find since GET /orders/{id} is not in API
        const orders = await httpRequest.get('orders');
        const order = orders.find(o => o.id == id);

        if (!order) {
            alert('Không tìm thấy đơn hàng!');
            window.location.href = 'index.html';
            return;
        }

        renderDetails(order);
    } catch (error) {
        console.error('Lỗi khi tải thông tin chi tiết đơn hàng:', error);
        alert('Không tìm thấy đơn hàng!');
        window.location.href = 'index.html';
    }
}

function renderDetails(order) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('order-details-content').style.display = 'block';

    document.getElementById('order-id-title').textContent = `#ORD-${order.id}`;
    document.getElementById('detail-id').textContent = `#ORD-${order.id}`;
    document.getElementById('detail-date').textContent = order.date || 'N/A';
    
    const statusMap = {
        'pending': { label: 'Chờ xử lý', class: 'pending' },
        'delivering': { label: 'Đang giao', class: 'shipping' },
        'done': { label: 'Hoàn thành', class: 'completed' },
        'cancel': { label: 'Đã hủy', class: 'cancelled' }
    };
    const statusInfo = statusMap[order.status] || { label: order.status, class: 'pending' };
    document.getElementById('detail-status').innerHTML = `<span class="badge ${statusInfo.class}">${statusInfo.label}</span>`;

    // Customer
    document.getElementById('detail-customer-name').textContent = order.customer?.name || 'Khách lẻ';
    document.getElementById('detail-customer-email').textContent = order.customer?.email || 'N/A';
    document.getElementById('detail-customer-phone').textContent = order.customer?.phone || 'N/A';

    // Product
    document.getElementById('detail-product-name').textContent = order.product?.name || 'N/A';
    const price = order.product?.price || 0;
    document.getElementById('detail-product-price').textContent = `${price.toLocaleString('vi-VN')}đ`;
    document.getElementById('detail-amount').textContent = order.amount || 1;
    
    // Total
    const total = price * (order.amount || 1);
    document.getElementById('detail-total').textContent = `${total.toLocaleString('vi-VN')}đ`;
}
