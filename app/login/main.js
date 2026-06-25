import httpRequest from "../../utils/httpRequest.js";
import getNewAccessToken from "../../utils/getNewAccessToken.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const emailField = document.getElementById("emailField");
    const passField = document.getElementById("passField");

    // show / hide password
    const toggle = document.getElementById("togglePass");
    const eye = document.getElementById("eyeIcon");
    const eyeOpen =
        '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/>';
    const eyeOff =
        '<path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M6.6 6.6A18.5 18.5 0 0 0 1 12s4 8 11 8a10.9 10.9 0 0 0 5.4-1.4"/><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"/><line x1="2" y1="2" x2="22" y2="22"/>';

    toggle.addEventListener("click", () => {
        const show = password.type === "password";
        password.type = show ? "text" : "password";
        eye.innerHTML = show ? eyeOff : eyeOpen;
        toggle.setAttribute("aria-pressed", String(show));
        toggle.setAttribute(
            "aria-label",
            show ? "Ẩn mật khẩu" : "Hiện mật khẩu",
        );
    });

    const loginError = document.getElementById("loginError");

    function clearErrors() {
        emailField.classList.remove("invalid");
        passField.classList.remove("invalid");
        loginError.style.display = "none";
    }

    email.addEventListener("input", clearErrors);
    password.addEventListener("input", clearErrors);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearErrors();

        const emailVal = email.value.trim();
        const passwordVal = password.value.trim();

        let valid = true;
        if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
            emailField.classList.add("invalid");
            valid = false;
        }
        if (passwordVal.length < 6) {
            passField.classList.add("invalid");
            valid = false;
        }
        if (!valid) return;

        try {
            const { accessToken, refreshToken } = await httpRequest.post(
                "auth/signin",
                { email: emailVal, password: passwordVal },
            );

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            window.location.href = "../index.html";
        } catch (error) {
            loginError.textContent = "Email hoặc mật khẩu không chính xác.";
            loginError.style.display = "block";
        }
    });
});
