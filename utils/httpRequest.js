import getNewAccessToken from "./getNewAccessToken.js";
class HttpRequest {
    constructor() {
        this.baseUrl =
            "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com/";
    }

    async _send(path, method, data, options = {}) {
        try {
            const _options = {
                ...options,
                method,
                headers: {
                    ...options.headers,
                    "Content-Type": "application/json",
                },
            };

            if (data) {
                _options.body = JSON.stringify(data);
            }

            const accessToken = localStorage.getItem("accessToken");
            if (accessToken) {
                _options.headers.Authorization = `Bearer ${accessToken}`;
            }
            const res = await fetch(`${this.baseUrl}${path}`, _options);
            const response = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    await getNewAccessToken();
                    return await this._send(path, method, data, (options = {}));
                }
                const error = new Error(`Http Error: `, res.status);
                error.response = response;
                error.status = res.status;
                throw error;
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    async get(path, options) {
        return await this._send(path, "GET", null, options);
    }

    async post(path, data, options) {
        return await this._send(path, "POST", data, options);
    }

    async put(path, data, options) {
        return await this._send(path, "PUT", data, options);
    }

    async patch(path, data, options) {
        return await this._send(path, "PATCH", data, options);
    }

    async del(path, options) {
        return await this._send(path, "DELETE", null, options);
    }
}

const httpRequest = new HttpRequest();
export default httpRequest;
