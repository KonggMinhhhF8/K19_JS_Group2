const API_URL = 'https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com';
let allOrders = [];
let currentFilter = 'all'; // 'all', 'pending', 'delivering', 'done'
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();

    // Event listener for search
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterAndRenderOrders();
        });
    }

    // Event listeners for tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked
            tab.classList.add('active');
            
            // Map index to status
            if (index === 0) currentFilter = 'all';
            else if (index === 1) currentFilter = 'pending';
            else if (index === 2) currentFilter = 'delivering';
            else if (index === 3) currentFilter = 'done';
            
            filterAndRenderOrders();
        });
    });
});

async function fetchOrders() {
    try {
        const response = await fetchWithAuth('/orders', {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allOrders = await response.json();
    } catch (error) {
        console.error('Lỗi khi tải danh sách đơn hàng:', error);
        allOrders = [];
    }
    updateStats(allOrders);
    filterAndRenderOrders();
}

function filterAndRenderOrders() {
    let filtered = allOrders;

    // Filter by tab status
    if (currentFilter !== 'all') {
        filtered = filtered.filter(o => o.status === currentFilter);
    }

    // Filter by search query (order ID or customer name)
    if (searchQuery !== '') {
        filtered = filtered.filter(o => {
            const idMatch = `ord-${o.id}`.includes(searchQuery);
            const nameMatch = (o.customer?.name || '').toLowerCase().includes(searchQuery);
            return idMatch || nameMatch;
        });
    }

    renderOrders(filtered);
}

function renderOrders(orders) {
    const tbody = document.querySelector('#order-list');
    if (!tbody) return;
    
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
                <button class="btn-action" title="Xem chi tiết" onclick="viewOrder(${order.id})"><i class="fas fa-eye"></i></button>
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

function viewOrder(id) {
    // Navigate to a details page or show modal
    window.location.href = `order-details.html?id=${id}`;
}

async function deleteOrder(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;
    
    try {
        const response = await fetchWithAuth(`/orders/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Lỗi khi xóa đơn hàng');
        }
        
        fetchOrders();
    } catch (error) {
        console.error('Lỗi khi xóa:', error);
        alert('Xóa thất bại!');
    }
}
