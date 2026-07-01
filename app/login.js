const API_URL = 'https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const btnSubmit = document.getElementById('btn-submit');
    const errorMsg = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Reset state
        errorMsg.style.display = 'none';
        btnSubmit.classList.add('loading');
        btnSubmit.disabled = true;

        try {
            
            const response = await fetch(`${API_URL}/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Đăng nhập thất bại');
            }

            const data = await response.json();
            
            // API thường trả về token ở data.accessToken hoặc data.token
            const token = data.accessToken || data.token;
            const refreshToken = data.refreshToken;
            
            if (token) {
                // Lưu token vào localStorage
                localStorage.setItem('accessToken', token);
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }
                
                // Chuyển hướng về trang chủ
                window.location.href = '../app/orders/index.html';
            } else {
                throw new Error('Không nhận được token từ server');
            }

        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            errorMsg.textContent = 'Email hoặc mật khẩu không đúng!';
            errorMsg.style.display = 'block';
        } finally {
            btnSubmit.classList.remove('loading');
            btnSubmit.disabled = false;
        }
    });
});
