// ============================================================
// AdminDocumentCard.jsx
// Карточка ОДНОГО документа в админ-панели.
//
// Визуальный принцип:
//   Как и у объявлений — поля расположены вертикально,
//   в том же порядке, что и на сайте.
//   Дополнительно: превью картинки, поля src / alt / downloadUrl.
// ============================================================

const AdminDocumentCard = ({ index, doc, onChange, onDelete }) => {
    return (
        <div className="admin-card admin-card--document">
            {/* ---- Шапка: номер + удаление ---- */}
            <div className="admin-card__header">
                <span className="admin-card__number">
                    {String(index + 1).padStart(2, "0")}
                </span>
                <button
                    className="admin-card__delete"
                    onClick={() => onDelete(index)}
                    title="Удалить документ"
                >
                    ✕
                </button>
            </div>

            <div className="admin-card__body">
                {/*
                    Превью картинки.
                    Если src пустой или битый — показываем заглушку.
                */}
                <div className="admin-field">
                    <label className="admin-field__label">Превью изображения</label>
                    <div className="admin-image-preview">
                        {doc.src ? (
                            <img
                                src={doc.src}
                                alt={doc.alt || "Превью"}
                                className="admin-image-preview__img"
                                onError={(e) => {
                                    // Если картинка не загрузилась — показываем заглушку
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                }}
                            />
                        ) : null}
                        <div
                            className="admin-image-preview__placeholder"
                            style={{ display: doc.src ? "none" : "flex" }}
                        >
                            🖼️ Нет изображения
                        </div>
                    </div>
                </div>

                {/* Заголовок (label) */}
                <div className="admin-field">
                    <label className="admin-field__label">Заголовок</label>
                    <input
                        type="text"
                        className="admin-field__input"
                        value={doc.label}
                        onChange={(e) => onChange(index, "label", e.target.value)}
                        placeholder="Название документа..."
                    />
                </div>

                {/* Подзаголовок (sublabel) */}
                <div className="admin-field">
                    <label className="admin-field__label">Подзаголовок</label>
                    <input
                        type="text"
                        className="admin-field__input"
                        value={doc.sublabel}
                        onChange={(e) => onChange(index, "sublabel", e.target.value)}
                        placeholder="Необязательно..."
                    />
                </div>

                {/* Описание (description) */}
                <div className="admin-field">
                    <label className="admin-field__label">Описание</label>
                    <textarea
                        className="admin-field__textarea"
                        value={doc.description}
                        onChange={(e) => onChange(index, "description", e.target.value)}
                        placeholder="Описание документа..."
                        rows={3}
                    />
                </div>

                {/* Путь к изображению (src) */}
                <div className="admin-field">
                    <label className="admin-field__label">Путь к изображению (src)</label>
                    <input
                        type="text"
                        className="admin-field__input"
                        value={doc.src}
                        onChange={(e) => onChange(index, "src", e.target.value)}
                        placeholder="src/assets/images/documents/img.png"
                    />
                </div>

                {/* Alt-текст (alt) */}
                <div className="admin-field">
                    <label className="admin-field__label">Alt-текст</label>
                    <input
                        type="text"
                        className="admin-field__input"
                        value={doc.alt}
                        onChange={(e) => onChange(index, "alt", e.target.value)}
                        placeholder="Альтернативный текст..."
                    />
                </div>

                {/* Ссылка для скачивания (downloadUrl) */}
                <div className="admin-field">
                    <label className="admin-field__label">URL для скачивания</label>
                    <input
                        type="text"
                        className="admin-field__input"
                        value={doc.downloadUrl}
                        onChange={(e) => onChange(index, "downloadUrl", e.target.value)}
                        placeholder="src/assets/images/documents/img.png"
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminDocumentCard;