const API_URL = "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com";

export default async function getNewAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
        _logout();
        return null;
    }

    try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) throw new Error("Refresh token expired");

        const data = await res.json();
        localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
        }
        return data.accessToken;
    } catch (error) {
        console.error("Token refresh failed:", error);
        _logout();
        return null;
    }
}

function _logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // Redirect về login (hoạt động đúng với các trang 1 cấp trong app/)
    window.location.href = "../login/index.html";
}
