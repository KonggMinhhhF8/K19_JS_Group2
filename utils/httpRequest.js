import getNewAccessToken from "./getNewAccessToken.js";

const API_URL = "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com";

async function request(endpoint, options = {}) {
    let token = localStorage.getItem("accessToken");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let res = await fetch(`${API_URL}/${endpoint}`, { ...options, headers });

    // Auto-retry khi token hết hạn
    if (res.status === 401) {
        token = await getNewAccessToken();
        if (!token) throw new Error("Session expired. Please login again.");
        headers.Authorization = `Bearer ${token}`;
        res = await fetch(`${API_URL}/${endpoint}`, { ...options, headers });
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Request failed with status ${res.status}`);
    }

    return res.json();
}

const httpRequest = {
    get(endpoint) {
        return request(endpoint, { method: "GET" });
    },
    post(endpoint, body) {
        return request(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    put(endpoint, body) {
        return request(endpoint, {
            method: "PUT",
            body: JSON.stringify(body),
        });
    },
    del(endpoint) {
        return request(endpoint, { method: "DELETE" });
    },
};

export default httpRequest;
