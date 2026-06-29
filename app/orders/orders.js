const API_URL = 'https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com';

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
});

async function fetchOrders() {
    try {
        // Retrieve token if you have implemented auth, otherwise pass empty or mock.
        const token = localStorage.getItem('accessToken') || '';
        
        const response = await fetch(`${API_URL}/orders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orders = await response.json();
        renderOrders(orders);
        updateStats(orders);
    } catch (error) {
        console.error('Lỗi khi tải danh sách đơn hàng:', error);
        alert('Không thể tải danh sách đơn hàng. Vui lòng kiểm tra lại kết nối hoặc đăng nhập.');
    }
}

function renderOrders(orders) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Chưa có đơn hàng nào</td></tr>';
        return;
    }

    orders.forEach(order => {
        const statusMap = {
            'pending': { label: 'Chờ xử lý', class: 'pending' },
            'delivering': { label: 'Đang giao', class: 'shipping' },
            'done': { label: 'Hoàn thành', class: 'completed' },
            'cancel': { label: 'Đã hủy', class: 'cancelled' }
        };

        const statusInfo = statusMap[order.status] || { label: order.status, class: 'pending' };
        
        // Calculate total if amount and product price exist, otherwise 0
        const price = order.product?.price || 0;
        const total = price * (order.amount || 1);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#ORD-${order.id}</strong></td>
            <td>${order.customer?.name || 'Khách lẻ'}<br><small>${order.customer?.phone || ''}</small></td>
            <td>${order.product?.name || 'Sản phẩm không tồn tại'} (x${order.amount || 1})</td>
            <td>${total.toLocaleString('vi-VN')}đ</td>
            <td><span class="badge ${statusInfo.class}">${statusInfo.label}</span></td>
            <td>
                <button class="btn-action" title="Sửa" onclick="editOrder(${order.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-action" title="Xóa" onclick="deleteOrder(${order.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateStats(orders) {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const doneOrders = orders.filter(o => o.status === 'done').length;
    const cancelOrders = orders.filter(o => o.status === 'cancel').length;

    const cards = document.querySelectorAll('.card p');
    if (cards.length >= 4) {
        cards[0].textContent = totalOrders.toLocaleString('vi-VN');
        cards[1].textContent = pendingOrders.toLocaleString('vi-VN');
        cards[2].textContent = doneOrders.toLocaleString('vi-VN');
        cards[3].textContent = cancelOrders.toLocaleString('vi-VN');
    }
}

function editOrder(id) {
    window.location.href = `order-form.html?id=${id}`;
}

async function deleteOrder(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;
    
    try {
        const token = localStorage.getItem('accessToken') || '';
        const response = await fetch(`${API_URL}/orders/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Lỗi khi xóa đơn hàng');
        }
        
        // Reload list after delete
        fetchOrders();
    } catch (error) {
        console.error('Lỗi khi xóa:', error);
        alert('Xóa thất bại!');
    }
}
