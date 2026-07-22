// ============================================================
// AdminDocumentCard.jsx
// ЧТО ИЗМЕНИЛОСЬ:
//   При выборе изображения оно теперь СЖИМАЕТСЯ через compressImage
//   перед сохранением. Это защищает от лимита Firestore в 1 МБ.
// ============================================================

import { useRef } from "react";
import { compressImage } from "../../utils/compressImage"; // ← новый импорт

const AdminDocumentCard = ({ index, doc, onChange, onDelete }) => {
    const srcInputRef = useRef(null);
    const downloadInputRef = useRef(null);

    /**
     * Выбор изображения для ПРЕВЬЮ (src).
     * Теперь со сжатием.
     */
    const handleSrcFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Проверяем, что это изображение
        if (!file.type.startsWith("image/")) {
            alert("Пожалуйста, выберите файл изображения (PNG, JPG, GIF и т.д.)");
            return;
        }

        try {
            // Показываем, что идёт обработка (опционально)
            // Сжимаем: максимум 1200px по ширине, качество 70%
            const compressedBase64 = await compressImage(file, 1200, 0.7);

            // Сохраняем СЖАТУЮ картинку (весит в разы меньше оригинала)
            onChange(index, "src", compressedBase64);
        } catch (error) {
            console.error("Ошибка сжатия изображения:", error);
            alert("Не удалось обработать изображение. Попробуйте другой файл.");
        }
    };

    /**
     * Выбор файла для СКАЧИВАНИЯ (downloadUrl).
     * Здесь сжатие НЕ применяем (это может быть PDF/DOCX),
     * но проверяем размер, чтобы не превысить лимит Firestore.
     */
    const handleDownloadFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Лимит ~700 КБ для файла скачивания (с запасом под 1 МБ документа)
        if (file.size > 700 * 1024) {
            alert(
                "Файл слишком большой для хранения в облаке.\n" +
                "Максимум ~700 КБ. Сожмите файл или используйте ссылку на облачное хранилище."
            );
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            onChange(index, "downloadUrl", event.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveSrc = () => {
        onChange(index, "src", "");
        if (srcInputRef.current) srcInputRef.current.value = "";
    };

    const handleRemoveDownload = () => {
        onChange(index, "downloadUrl", "");
        if (downloadInputRef.current) downloadInputRef.current.value = "";
    };

    // ... ДАЛЬШЕ ИДЁТ ТОТ ЖЕ JSX (return), ЧТО БЫЛ РАНЬШЕ ...
    // Его менять не нужно — поля, кнопки, превью остаются прежними.

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
                {/* ============================================
                    ПРЕВЬЮ ИЗОБРАЖЕНИЯ + КНОПКА ВЫБОРА ФАЙЛА
                    ============================================ */}
                <div className="admin-field">
                    <label className="admin-field__label">Изображение документа</label>

                    {/* Превью: показываем картинку или заглушку */}
                    <div className="admin-image-preview">
                        {doc.src ? (
                            <img
                                src={doc.src}
                                alt={doc.alt || "Превью"}
                                className="admin-image-preview__img"
                            />
                        ) : (
                            <div className="admin-image-preview__placeholder">
                                🖼️ Изображение не выбрано
                            </div>
                        )}
                    </div>

                    {/*
                        СКРЫТЫЙ input type="file".
                        accept="image/*" — в проводнике показываются только картинки.
                        style={{display:"none"}} — прячем стандартный некрасивый инпут.
                    */}
                    <input
                        ref={srcInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleSrcFileSelect}
                    />

                    {/* Кнопки: выбрать / удалить */}
                    <div className="admin-file-buttons">
                        <button
                            type="button"
                            className="admin-btn admin-btn--file"
                            onClick={() => srcInputRef.current?.click()}
                        >
                            📁 Выбрать изображение
                        </button>
                        {doc.src && (
                            <button
                                type="button"
                                className="admin-btn admin-btn--remove-file"
                                onClick={handleRemoveSrc}
                            >
                                ✕ Убрать
                            </button>
                        )}
                    </div>
                </div>

                {/* ---- Заголовок ---- */}
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

                {/* ---- Подзаголовок ---- */}
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

                {/* ---- Описание ---- */}
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

                {/* ---- Alt-текст ---- */}
                <div className="admin-field">
                    <label className="admin-field__label">Alt-текст (для доступности)</label>
                    <input
                        type="text"
                        className="admin-field__input"
                        value={doc.alt}
                        onChange={(e) => onChange(index, "alt", e.target.value)}
                        placeholder="Описание картинки..."
                    />
                </div>

                {/* ============================================
                    ФАЙЛ ДЛЯ СКАЧИВАНИЯ
                    ============================================ */}
                <div className="admin-field">
                    <label className="admin-field__label">Файл для скачивания</label>

                    {/* Показываем имя/статус выбранного файла */}
                    <div className="admin-file-status">
                        {doc.downloadUrl ? (
                            <span className="admin-file-status__selected">
                                ✅ Файл выбран
                            </span>
                        ) : (
                            <span className="admin-file-status__empty">
                                Файл не выбран
                            </span>
                        )}
                    </div>

                    {/* Скрытый input для файла скачивания (любой тип) */}
                    <input
                        ref={downloadInputRef}
                        type="file"
                        style={{ display: "none" }}
                        onChange={handleDownloadFileSelect}
                    />

                    <div className="admin-file-buttons">
                        <button
                            type="button"
                            className="admin-btn admin-btn--file"
                            onClick={() => downloadInputRef.current?.click()}
                        >
                            📎 Выбрать файл для скачивания
                        </button>
                        {doc.downloadUrl && (
                            <button
                                type="button"
                                className="admin-btn admin-btn--remove-file"
                                onClick={handleRemoveDownload}
                            >
                                ✕ Убрать
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDocumentCard;