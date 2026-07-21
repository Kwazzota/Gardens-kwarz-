// ============================================================
// AdminPage.jsx
// Страница админ-панели (маршрут /admin).
//
// Возможности:
//   1. Редактирование полей каждого объявления / документа.
//   2. Удаление элемента.
//   3. Добавление нового элемента.
//   4. Все изменения сразу сохраняются в localStorage.
//   5. Кнопка "Сбросить к дефолтным" — возвращает исходные данные.
//
// Визуальный принцип:
//   Каждая карточка в админке выглядит как ПРЕВЬЮ реальной карточки.
//   Поля (label, sublabel, description) расположены ВЕРТИКАЛЬНО,
//   точно так же, как пользователь видит их на главной странице.
//   Это делает редактирование интуитивно понятным.
// ============================================================

import { useState } from "react";
import { Link } from "react-router-dom";
import { useLocalStorageData } from "../hooks/useLocalStorageData";
import { defaultItems, defaultDocuments } from "../data/defaultData";
import AdminAnnouncementCard from "../components/admin/AdminAnnouncementCard";
import AdminDocumentCard from "../components/admin/AdminDocumentCard";

const AdminPage = () => {
    // --- Данные объявлений ---
    const { data: items, setData: setItems } = useLocalStorageData("app_items", defaultItems);

    // --- Данные документов ---
    const { data: documents, setData: setDocuments } = useLocalStorageData("app_documents", defaultDocuments);

    // --- Активная вкладка: "announcements" или "documents" ---
    const [activeTab, setActiveTab] = useState("announcements");

    // ============================================================
    // ОБЪЯВЛЕНИЯ: обработчики
    // ============================================================

    /** Обновить одно объявление по индексу */
    const handleItemChange = (index, field, value) => {
        setItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    /** Удалить объявление по индексу */
    const handleItemDelete = (index) => {
        if (window.confirm("Удалить это объявление?")) {
            setItems((prev) => prev.filter((_, i) => i !== index));
        }
    };

    /** Добавить новое объявление в конец списка */
    const handleItemAdd = () => {
        setItems((prev) => [
            ...prev,
            {
                label: `Объявление ${prev.length + 1}`,
                sublabel: "",
                description: "Новое объявление",
            },
        ]);
    };

    // ============================================================
    // ДОКУМЕНТЫ: обработчики
    // ============================================================

    /** Обновить один документ по индексу */
    const handleDocChange = (index, field, value) => {
        setDocuments((prev) =>
            prev.map((doc, i) =>
                i === index ? { ...doc, [field]: value } : doc
            )
        );
    };

    /** Удалить документ по индексу */
    const handleDocDelete = (index) => {
        if (window.confirm("Удалить этот документ?")) {
            setDocuments((prev) => prev.filter((_, i) => i !== index));
        }
    };

    /** Добавить новый документ в конец списка */
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
    // СБРОС к дефолтным данным
    // ============================================================
    const handleReset = () => {
        if (window.confirm("Сбросить ВСЕ данные к начальным? Изменения будут потеряны.")) {
            setItems(defaultItems);
            setDocuments(defaultDocuments);
        }
    };

    return (
        <div className="admin-page">
            {/* ---- Шапка админки ---- */}
            <header className="admin-header">
                <h1 className="admin-header__title">⚙️ Админ-панель</h1>
                <div className="admin-header__actions">
                    <Link to="/" className="admin-btn admin-btn--back">
                        ← Вернуться на сайт
                    </Link>
                    <button
                        className="admin-btn admin-btn--reset"
                        onClick={handleReset}
                    >
                        Сбросить к дефолтным
                    </button>
                </div>
            </header>

            {/* ---- Вкладки: Объявления / Документы ---- */}
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

            {/* ---- Контент активной вкладки ---- */}
            <main className="admin-content">
                {/* ========== ОБЪЯВЛЕНИЯ ========== */}
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

                {/* ========== ДОКУМЕНТЫ ========== */}
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