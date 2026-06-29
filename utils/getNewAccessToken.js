const BASE_URL =
    "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com/";

const getNewAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
        alert("Get data failed");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) throw new Error("Refresh failed");

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await res.json();
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
    } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "../login/index.html";
    }
};

export default getNewAccessToken;
