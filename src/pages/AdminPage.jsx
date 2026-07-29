// ============================================================
// AdminPage.jsx — админ-панель (маршрут /admin).
//
// ЧТО ДОБАВЛЕНО (задача 1):
//   - Третья вкладка «📰 Новости» и работа с массивом news через
//     useFirestoreData("news", defaultNews).
//   - Карточка новости — AdminNewsCard (заголовок + картинка + подпись).
//   - Сброс к дефолтным теперь трогает и новости.
// Остальное (авторизация, объявления, документы) — без изменений.
// ============================================================

import { useState } from "react";
import { Link } from "react-router-dom";
import { useFirestoreData } from "../hooks/useFirestoreData";
import { defaultItems, defaultDocuments, defaultNews } from "../data/defaultData";
import AdminAnnouncementCard from "../components/admin/AdminAnnouncementCard";
import AdminDocumentCard from "../components/admin/AdminDocumentCard";
import AdminNewsCard from "../components/admin/AdminNewsCard";
import AdminLogin from "../components/admin/AdminLogin";

const AdminPage = () => {
    const [isAuthed, setIsAuthed] = useState(
        () => sessionStorage.getItem("admin_auth") === "true"
    );

    // --- Данные ---
    const { data: items, setData: setItems, loading: itemsLoading } =
        useFirestoreData("announcements", defaultItems);
    const { data: documents, setData: setDocuments, loading: docsLoading } =
        useFirestoreData("documents", defaultDocuments);
    const { data: news, setData: setNews, loading: newsLoading } =
        useFirestoreData("news", defaultNews);

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
    // НОВОСТИ
    // ============================================================
    const handleNewsChange = (index, field, value) => {
        setNews((prev) =>
            prev.map((n, i) => (i === index ? { ...n, [field]: value } : n))
        );
    };
    const handleNewsDelete = (index) => {
        if (window.confirm("Удалить эту новость?")) {
            setNews((prev) => prev.filter((_, i) => i !== index));
        }
    };
    const handleNewsAdd = () => {
        setNews((prev) => [
            ...prev,
            {
                label: `Новость ${prev.length + 1}`,
                image: "",
                alt: `Новость ${prev.length + 1}`,
                description: "",
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
            setNews(defaultNews);
        }
    };

    // ============================================================
    // ВЫХОД
    // ============================================================
    const handleLogout = () => {
        sessionStorage.removeItem("admin_auth");
        setIsAuthed(false);
    };

    if (!isAuthed) {
        return <AdminLogin onSuccess={() => setIsAuthed(true)} />;
    }

    if (itemsLoading || docsLoading || newsLoading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <p>⏳ Загрузка данных из облака...</p>
            </div>
        );
    }

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
                <button
                    className={`admin-tab ${activeTab === "news" ? "admin-tab--active" : ""}`}
                    onClick={() => setActiveTab("news")}
                >
                    📰 Новости ({news.length})
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

                {activeTab === "news" && (
                    <section className="admin-section">
                        <div className="admin-section__header">
                            <h2>Управление новостями</h2>
                            <button className="admin-btn admin-btn--add" onClick={handleNewsAdd}>
                                + Добавить новость
                            </button>
                        </div>
                        <p className="admin-empty" style={{ marginBottom: "16px" }}>
                            ⚠️ Картинки новостей хранятся в облаке как часть одного документа.
                            После сжатия одна картинка ≈ 150–300 КБ, лимит документа — 1 МБ,
                            то есть примерно 3–5 баннеров. Если запись начнёт падать с ошибкой
                            размера — это он
                        </p>
                        <div className="admin-cards-grid">
                            {news.map((item, index) => (
                                <AdminNewsCard
                                    key={index}
                                    index={index}
                                    item={item}
                                    onChange={handleNewsChange}
                                    onDelete={handleNewsDelete}
                                />
                            ))}
                        </div>
                        {news.length === 0 && (
                            <p className="admin-empty">Нет новостей. Нажмите «+ Добавить».</p>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default AdminPage;