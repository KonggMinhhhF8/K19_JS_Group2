export default function authGuard() {
    const token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!token && !refreshToken) {
        localStorage.setItem("redirectAfterLogin", window.location.href);
        window.location.href = "../login/index.html";
        return false;
    }
    return true;
}
