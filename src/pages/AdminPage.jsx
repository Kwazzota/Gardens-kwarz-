// ============================================================
// AdminPage.jsx
// Страница админ-панели (маршрут /admin).
//
// ЧТО ДОБАВЛЕНО:
//   - Проверка авторизации через sessionStorage.
//   - Если не авторизован → показываем AdminLogin (форму пароля).
//   - Если авторизован → показываем админку.
//   - Кнопка "Выйти" → очищает sessionStorage → снова форма пароля.
// ============================================================

import { useState } from "react";
import { Link } from "react-router-dom";
import { useFirestoreData } from "../hooks/useFirestoreData";
import { defaultItems, defaultDocuments } from "../data/defaultData";
import AdminAnnouncementCard from "../components/admin/AdminAnnouncementCard";
import AdminDocumentCard from "../components/admin/AdminDocumentCard";
import AdminLogin from "../components/admin/AdminLogin";

const AdminPage = () => {
    // --- Проверка авторизации ---
    // Читаем sessionStorage: если "admin_auth" === "true" → пользователь ввёл пароль.
    const [isAuthed, setIsAuthed] = useState(
        () => sessionStorage.getItem("admin_auth") === "true"
    );

    // --- Данные ---
    const { data: items, setData: setItems, loading: itemsLoading } =
        useFirestoreData("announcements", defaultItems);
    const { data: documents, setData: setDocuments, loading: docsLoading } =
        useFirestoreData("documents", defaultDocuments);

    const [activeTab, setActiveTab] = useState("announcements");

    // ============================================================
    // ОБЪЯВЛЕНИЯ
    // ============================================================
    const handleItemChange = (index, field, value) => {
        setItems((prev) =>
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        );
    };

    const handleItemDelete = (index) => {
        if (window.confirm("Удалить это объявление?")) {
            setItems((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleItemAdd = () => {
        setItems((prev) => [
            ...prev,
            { label: `Объявление ${prev.length + 1}`, sublabel: "", description: "Новое объявление" },
        ]);
    };

    // ============================================================
    // ДОКУМЕНТЫ
    // ============================================================
    const handleDocChange = (index, field, value) => {
        setDocuments((prev) =>
            prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
        );
    };

    const handleDocDelete = (index) => {
        if (window.confirm("Удалить этот документ?")) {
            setDocuments((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleDocAdd = () => {
        setDocuments((prev) => [
            ...prev,
            {
                label: `Документ ${prev.length + 1}`,
                sublabel: "",
                description: "Новый документ",
                src: "",
                alt: `Документ ${prev.length + 1}`,
                downloadUrl: "",
            },
        ]);
    };

    // ============================================================
    // СБРОС
    // ============================================================
    const handleReset = () => {
        if (window.confirm("Сбросить ВСЕ данные к начальным?")) {
            setItems(defaultItems);
            setDocuments(defaultDocuments);
        }
    };

    // ============================================================
    // ВЫХОД из админки
    // ============================================================
    const handleLogout = () => {
        sessionStorage.removeItem("admin_auth"); // Удаляем маркер авторизации
        setIsAuthed(false); // Показываем форму пароля
    };

    // ============================================================
    // ЕСЛИ НЕ АВТОРИЗОВАН → показываем форму пароля
    // ============================================================
    if (!isAuthed) {
        return <AdminLogin onSuccess={() => setIsAuthed(true)} />;
    }

    if (itemsLoading || docsLoading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <p>⏳ Загрузка данных из облака...</p>
            </div>
        );
    }

    // ============================================================
    // АВТОРИЗОВАН → показываем админку
    // ============================================================
    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1 className="admin-header__title">⚙️ Админ-панель</h1>
                <div className="admin-header__actions">
                    <Link to="/" className="admin-btn admin-btn--back">
                        ← Вернуться на сайт
                    </Link>
                    <button className="admin-btn admin-btn--reset" onClick={handleReset}>
                        Сбросить к дефолтным
                    </button>
                    {/* Кнопка выхода — очищает sessionStorage */}
                    <button className="admin-btn admin-btn--logout" onClick={handleLogout}>
                        Выйти 🔓
                    </button>
                </div>
            </header>

            <nav className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === "announcements" ? "admin-tab--active" : ""}`}
                    onClick={() => setActiveTab("announcements")}
                >
                    📢 Объявления ({items.length})
                </button>
                <button
                    className={`admin-tab ${activeTab === "documents" ? "admin-tab--active" : ""}`}
                    onClick={() => setActiveTab("documents")}
                >
                    📄 Документы ({documents.length})
                </button>
            </nav>

            <main className="admin-content">
                {activeTab === "announcements" && (
                    <section className="admin-section">
                        <div className="admin-section__header">
                            <h2>Управление объявлениями</h2>
                            <button className="admin-btn admin-btn--add" onClick={handleItemAdd}>
                                + Добавить объявление
                            </button>
                        </div>
                        <div className="admin-cards-grid">
                            {items.map((item, index) => (
                                <AdminAnnouncementCard
                                    key={index}
                                    index={index}
                                    item={item}
                                    onChange={handleItemChange}
                                    onDelete={handleItemDelete}
                                />
                            ))}
                        </div>
                        {items.length === 0 && (
                            <p className="admin-empty">Нет объявлений. Нажмите «+ Добавить».</p>
                        )}
                    </section>
                )}

                {activeTab === "documents" && (
                    <section className="admin-section">
                        <div className="admin-section__header">
                            <h2>Управление документами</h2>
                            <button className="admin-btn admin-btn--add" onClick={handleDocAdd}>
                                + Добавить документ
                            </button>
                        </div>
                        <div className="admin-cards-grid">
                            {documents.map((doc, index) => (
                                <AdminDocumentCard
                                    key={index}
                                    index={index}
                                    doc={doc}
                                    onChange={handleDocChange}
                                    onDelete={handleDocDelete}
                                />
                            ))}
                        </div>
                        {documents.length === 0 && (
                            <p className="admin-empty">Нет документов. Нажмите «+ Добавить».</p>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default AdminPage;