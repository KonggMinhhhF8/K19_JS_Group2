import httpRequest from "./httpRequest.js";

const getNewAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
        alert("Get data failed");
        return;
    }

    try {
        const { accessToken, refreshToken } = await httpRequest.post(
            "auth/refresh-token",
            { refreshToken },
        );
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
    } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "../login/index.html";
    }
};

export default getNewAccessToken;
