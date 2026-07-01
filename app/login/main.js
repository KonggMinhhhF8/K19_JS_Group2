import httpRequest from "../../utils/httpRequest.js";
import { router } from "../router.js";

export function mount(el) {
    if (localStorage.getItem("refreshToken")) {
        router.navigate("/customers");
        return;
    }

    el.innerHTML = `
        <style>
            :root {
                --ink: #0E1726;
                --slate: #1B2A41;
                --teal: #0D9488;
                --teal-dark: #0B7C72;
                --field: #F4F6F8;
                --field-line: #D5DCE3;
                --muted: #67748A;
                --white: #FFFFFF;
                --danger: #D9534F;
                --radius: 16px;
            }

            #app {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
            }

            body {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                background:
                    radial-gradient(1100px 600px at 15% -10%, #25405E 0%, transparent 55%),
                    radial-gradient(900px 700px at 110% 120%, #0D9488 0%, transparent 50%),
                    linear-gradient(160deg, #0E1726 0%, #14223A 60%, #0E1726 100%);
            }

            body::before {
                content: "";
                position: fixed;
                inset: 0;
                pointer-events: none;
                opacity: .04;
                background-image: radial-gradient(var(--white) 1px, transparent 1px);
                background-size: 4px 4px;
            }

            .card {
                position: relative;
                width: 100%;
                max-width: 410px;
                background: var(--white);
                border-radius: var(--radius);
                padding: 40px 36px 32px;
                box-shadow: 0 30px 70px -25px rgba(8, 16, 30, .65);
                animation: rise .6s cubic-bezier(.2, .8, .2, 1) both;
            }

            @keyframes rise {
                from { opacity: 0; transform: translateY(18px) scale(.985); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
            }

            .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
            .brand .dot {
                width: 34px; height: 34px; border-radius: 10px;
                background: linear-gradient(140deg, var(--teal), #3BC0B3);
                display: grid; place-items: center;
                box-shadow: 0 6px 16px -4px rgba(13, 148, 136, .6);
            }
            .brand .dot svg { width: 18px; height: 18px; }
            .brand span { font-family: "Space Grotesk", sans-serif; font-weight: 600; letter-spacing: .2px; }

            h1 { font-family: "Space Grotesk", sans-serif; font-size: 1.7rem; line-height: 1.15; font-weight: 700; margin: 0 0 6px; }
            .sub { margin: 0 0 28px; color: var(--muted); font-size: .93rem; }

            .field { position: relative; margin-bottom: 18px; }
            .field input {
                width: 100%; padding: 22px 14px 8px; font-size: .97rem; font-family: inherit;
                color: var(--ink); background: var(--field);
                border: 1.5px solid transparent; border-radius: 12px; outline: none;
                transition: border-color .18s ease, background .18s ease, box-shadow .18s ease;
            }
            .field input:hover { background: #EEF1F4; }
            .field input:focus { background: var(--white); border-color: var(--teal); box-shadow: 0 0 0 4px rgba(13, 148, 136, .12); }

            .field label {
                position: absolute; left: 15px; top: 15px; color: var(--muted); font-size: .97rem;
                pointer-events: none; transition: transform .16s ease, color .16s ease, font-size .16s ease;
                transform-origin: left top;
            }
            .field input:focus + label,
            .field input:not(:placeholder-shown) + label { transform: translateY(-9px) scale(.78); color: var(--teal-dark); font-weight: 500; }

            .toggle {
                position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
                border: none; background: transparent; color: var(--muted);
                width: 38px; height: 38px; border-radius: 9px; cursor: pointer;
                display: grid; place-items: center;
                transition: color .15s ease, background .15s ease;
            }
            .toggle:hover { color: var(--ink); background: #EAEEF2; }
            .toggle svg { width: 20px; height: 20px; }

            .btn {
                width: 100%; padding: 14px; font-family: "Space Grotesk", sans-serif;
                font-size: 1rem; font-weight: 600; letter-spacing: .2px;
                color: var(--white); background: linear-gradient(135deg, var(--teal), var(--teal-dark));
                border: none; border-radius: 12px; cursor: pointer;
                box-shadow: 0 12px 24px -10px rgba(13, 148, 136, .8);
                transition: transform .12s ease, box-shadow .18s ease, filter .18s ease;
            }
            .btn:hover { filter: brightness(1.05); box-shadow: 0 16px 30px -10px rgba(13, 148, 136, .9); }
            .btn:active { transform: translateY(1px); }

            .error { display: none; color: var(--danger); font-size: .82rem; margin: 6px 2px 0; }
            .field.invalid input { border-color: var(--danger); background: var(--white); }
            .field.invalid .error { display: block; }

            a:focus-visible, button:focus-visible, input:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

            @media (prefers-reduced-motion: reduce) {
                .card { animation: none; }
                * { transition: none !important; }
            }
            @media (max-width: 420px) {
                .card { padding: 32px 22px 26px; }
                h1 { font-size: 1.45rem; }
            }
        </style>

        <main class="card">
            <h1>Chào mừng trở lại</h1>
            <p class="sub">Đăng nhập để tiếp tục vào tài khoản của bạn.</p>

            <form id="loginForm" novalidate>
                <div class="field" id="emailField">
                    <input type="email" id="email" name="email" placeholder=" " autocomplete="email" required>
                    <label for="email">Email</label>
                    <p class="error">Vui lòng nhập một email hợp lệ.</p>
                </div>

                <div class="field" id="passField">
                    <input type="password" id="password" name="password" placeholder=" " autocomplete="current-password" required>
                    <label for="password">Mật khẩu</label>
                    <button type="button" class="toggle" id="togglePass" aria-label="Hiện mật khẩu" aria-pressed="false">
                        <svg id="eyeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <p class="error">Mật khẩu phải có ít nhất 6 ký tự.</p>
                </div>

                <p class="error" id="loginError" style="text-align:center; margin-bottom:10px;"></p>
                <button type="submit" class="btn">Đăng nhập</button>
            </form>
        </main>
    `;

    const form = el.querySelector("#loginForm");
    const email = el.querySelector("#email");
    const password = el.querySelector("#password");
    const emailField = el.querySelector("#emailField");
    const passField = el.querySelector("#passField");

    const toggle = el.querySelector("#togglePass");
    const eye = el.querySelector("#eyeIcon");
    const eyeOpen = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/>';
    const eyeOff = '<path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M6.6 6.6A18.5 18.5 0 0 0 1 12s4 8 11 8a10.9 10.9 0 0 0 5.4-1.4"/><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"/><line x1="2" y1="2" x2="22" y2="22"/>';

    toggle.addEventListener("click", () => {
        const show = password.type === "password";
        password.type = show ? "text" : "password";
        eye.innerHTML = show ? eyeOff : eyeOpen;
        toggle.setAttribute("aria-pressed", String(show));
        toggle.setAttribute("aria-label", show ? "Ẩn mật khẩu" : "Hiện mật khẩu");
    });

    const loginError = el.querySelector("#loginError");

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
                { email: emailVal, password: passwordVal }
            );

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            const redirect = localStorage.getItem("redirectAfterLogin");
            localStorage.removeItem("redirectAfterLogin");
            router.navigate(redirect || "/customers");
        } catch (error) {
            loginError.textContent = "Email hoặc mật khẩu không chính xác.";
            loginError.style.display = "block";
        }
    });
}
