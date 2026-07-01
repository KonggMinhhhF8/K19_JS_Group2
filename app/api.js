const API_BASE_URL = 'https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com';

async function fetchWithAuth(endpoint, options = {}) {
    let token = localStorage.getItem('accessToken') || 'mock_token';
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    // Only set Authorization if not explicitly overridden
    if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // If 401 Unauthorized, try to refresh token
    if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
            try {
                const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken })
                });

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    const newToken = data.accessToken || data.token;
                    
                    if (newToken) {
                        localStorage.setItem('accessToken', newToken);
                        if (data.refreshToken) {
                            localStorage.setItem('refreshToken', data.refreshToken);
                        }
                        
                        // Retry original request with new token
                        headers['Authorization'] = `Bearer ${newToken}`;
                        response = await fetch(`${API_BASE_URL}${endpoint}`, { ...config, headers });
                    }
                } else {
                    redirectToLogin();
                }
            } catch (error) {
                console.error('Refresh token failed:', error);
                redirectToLogin();
            }
        } else {
            redirectToLogin();
        }
    }

    return response;
}

function redirectToLogin() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    const isOrdersPath = window.location.pathname.includes('/orders/');
    window.location.href = isOrdersPath ? '../login.html' : 'login.html';
}
