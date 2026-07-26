// ============================================================
// AdminNewsCard.jsx
// Карточка ОДНОЙ новости в админ-панели (вкладка «📰 Новости»).
//
// Поля:
//   - Заголовок (label)        — то, что видно в свёрнутом баннере;
//   - Изображение (image)      — то, что видно в раскрытом баннере;
//                                сжимается через compressImage, чтобы
//                                не упереться в лимит Firestore 1 МБ;
//   - Подпись (description)    — мелкий текст под картинкой (опц.);
//   - Alt-текст (alt)          — для доступности.
//
// Сделано по образцу AdminDocumentCard (те же CSS-классы admin-*),
// но БЕЗ полей sublabel и downloadUrl — новостям они не нужны.
// ============================================================

import { useRef } from "react";
import { compressImage } from "../../utils/compressImage";

const AdminNewsCard = ({ index, item, onChange, onDelete }) => {
    const imageInputRef = useRef(null);

    // Выбор картинки новости — со сжатием (как в документах).
    const handleImageSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Пожалуйста, выберите файл изображения (PNG, JPG, GIF и т.д.)");
            return;
        }

        try {
            // Для баннеров чуть выше качество и ширина — они крупные.
            const compressedBase64 = await compressImage(file, 1400, 0.78);
            onChange(index, "image", compressedBase64);
        } catch (error) {
            console.error("Ошибка сжатия изображения:", error);
            alert("Не удалось обработать изображение. Попробуйте другой файл.");
        }
    };

    const handleRemoveImage = () => {
        onChange(index, "image", "");
        if (imageInputRef.current) imageInputRef.current.value = "";
    };

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
                    title="Удалить новость"
                >
                    ✕
                </button>
            </div>

            <div className="admin-card__body">
                {/* ============================================
                    КАРТИНКА НОВОСТИ (баннер в раскрытом виде)
                    ============================================ */}
                <div className="admin-field">
                    <label className="admin-field__label">
                        Изображение новости (баннер)
                    </label>

                    <div className="admin-image-preview">
                        {item.image ? (
                            <img
                                src={item.image}
                                alt={item.alt || "Превью новости"}
                                className="admin-image-preview__img"
                            />
                        ) : (
                            <div className="admin-image-preview__placeholder">
                                🖼️ Изображение не выбрано
                            </div>
                        )}
                    </div>

                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageSelect}
                    />

                    <div className="admin-file-buttons">
                        <button
                            type="button"
                            className="admin-btn admin-btn--file"
                            onClick={() => imageInputRef.current?.click()}
                        >
                            📁 Выбрать изображение
                        </button>
                        {item.image && (
                            <button
                                type="button"
                                className="admin-btn admin-btn--remove-file"
                                onClick={handleRemoveImage}
                            >
                                ✕ Убрать
                            </button>
                        )}
                    </div>
                </div>

                {/* ---- Заголовок (свёрнутый баннер) ---- */}
                <div className="admin-field">
                    <label className="admin-field__label">Заголовок</label>
                    <input
                        type="text"
                        className="admin-field__input"
                        value={item.label}
                        onChange={(e) => onChange(index, "label", e.target.value)}
                        placeholder="Название новости..."
                    />
                </div>

                {/* ---- Подпись под картинкой (опционально) ---- */}
                <div className="admin-field">
                    <label className="admin-field__label">Подпись (необязательно)</label>
                    <textarea
                        className="admin-field__textarea"
                        value={item.description}
                        onChange={(e) => onChange(index, "description", e.target.value)}
                        placeholder="Короткий текст под картинкой..."
                        rows={2}
                    />
                </div>

                {/* ---- Alt-текст ---- */}
                <div className="admin-field">
                    <label className="admin-field__label">Alt-текст (для доступности)</label>
                    <input
                        type="text"
                        className="admin-field__input"
                        value={item.alt}
                        onChange={(e) => onChange(index, "alt", e.target.value)}
                        placeholder="Описание картинки..."
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminNewsCard;