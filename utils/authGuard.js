const authGuard = (loginPath = "../login/index.html") => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
        localStorage.setItem("redirectAfterLogin", window.location.href);
        window.location.href = loginPath;
        return false;
    }
    return true;
};

export default authGuard;
