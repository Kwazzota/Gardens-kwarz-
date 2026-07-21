// ============================================================
// AdminLogin.jsx
// Экран ввода пароля. Показывается ВМЕСТО админки,
// пока пользователь не введёт правильный пароль.
//
// Как работает:
//   1. Пользователь заходит на /admin → видит форму пароля.
//   2. Вводит пароль → проверяется с ADMIN_PASSWORD.
//   3. Если верно → sessionStorage.setItem("admin_auth", "true").
//   4. AdminPage проверяет sessionStorage: если "true" → показывает админку.
//   5. При закрытии вкладки sessionStorage очищается → нужно вводить снова.
//
// ВАЖНО: это НЕ настоящая безопасность (пароль виден в коде).
// Это защита от случайных пользователей. Для настоящей защиты
// нужен бэкенд с авторизацией.
// ============================================================

import { useState } from "react";

// Пароль для входа. Измените на свой.
const ADMIN_PASSWORD = "admin2026";

const AdminLogin = ({ onSuccess }) => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password === ADMIN_PASSWORD) {
            // Пароль верный → записываем в sessionStorage.
            // sessionStorage живёт пока открыта вкладка браузера.
            // Закрыл вкладку → нужно вводить пароль заново.
            sessionStorage.setItem("admin_auth", "true");
            onSuccess(); // Сообщаем AdminPage, что можно показывать админку
        } else {
            // Пароль неверный → показываем ошибку
            setError(true);
            setPassword("");
        }
    };

    return (
        <div className="admin-login">
            <form className="admin-login__form" onSubmit={handleSubmit}>
                <div className="admin-login__icon">🔒</div>
                <h2 className="admin-login__title">Вход в админ-панель</h2>
                <p className="admin-login__subtitle">Введите пароль для доступа</p>

                <input
                    type="password"
                    className={`admin-login__input ${error ? "admin-login__input--error" : ""}`}
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError(false); // Сбрасываем ошибку при вводе
                    }}
                    placeholder="Пароль..."
                    autoFocus
                />

                {/* Сообщение об ошибке */}
                {error && (
                    <p className="admin-login__error">Неверный пароль. Попробуйте снова.</p>
                )}

                <button type="submit" className="admin-login__btn">
                    Войти
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;