// ============================================================
// AdminDocumentCard.jsx — карточка документа в админке (задача 4).
//
// ЧТО ИЗМЕНИЛОСЬ:
//   Файлы БОЛЬШЕ НЕ кладутся в Firestore base64-ом (лимит 1 МБ).
//   Теперь и превью-картинка (src), и файл скачивания (downloadUrl)
//   загружаются в Firebase Storage через uploadFile(), а в Firestore
//   пишется только возвращённая ссылка.
//   - УБРАНА отсечка 700 КБ — PDF любого размера до 20 МБ грузится.
//   - Превью-картинка по-прежнему СЖИМАЕТСЯ (compressImage) ПЕРЕД
//     загрузкой, чтобы не хранить 5 МБ оригинал и быстрее грузить на сайте.
//   - Добавлен индикатор прогресса загрузки (⏳ … %), чтобы админ не
//     думал, что зависло.
//   - <img src={doc.src}> работает и для base64 (старые данные), и для
//     https-ссылки из Storage — превью менять не пришлось.
//   Обратная совместимость: старые документы с base64 продолжают
//   отображаться; новые сохраняются ссылками.
// ============================================================

import { useRef, useState } from "react";
import { compressImage } from "../../utils/compressImage";
import { uploadFile } from "../../utils/uploadToStorage";

const AdminDocumentCard = ({ index, doc, onChange, onDelete }) => {
    const srcInputRef = useRef(null);
    const downloadInputRef = useRef(null);

    // Прогресс загрузки (null = не грузим). Отдельно для превью и файла.
    const [srcProgress, setSrcProgress] = useState(null);
    const [dlProgress, setDlProgress] = useState(null);

    /** Выбор картинки ПРЕВЬЮ: сжатие → загрузка в Storage → ссылка в поле src. */
    const handleSrcFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Пожалуйста, выберите файл изображения (PNG, JPG, GIF и т.д.)");
            return;
        }

        setSrcProgress(0);
        try {
            // 1) Сжимаем в base64 (как раньше).
            const compressedDataUrl = await compressImage(file, 1400, 0.8);
            // 2) base64 → Blob → File (чтобы у загрузки было имя и тип).
            const blob = await (await fetch(compressedDataUrl)).blob();
            const baseName = (file.name || "image").replace(/\.[^.]+$/, "");
            const jpg = new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
            // 3) Грузим в Storage, получаем ссылку.
            const url = await uploadFile(jpg, "documents/images", setSrcProgress);
            onChange(index, "src", url);
        } catch (error) {
            console.error("Ошибка загрузки изображения:", error);
            alert("Не удалось загрузить изображение. Проверьте интернет и попробуйте снова.");
        } finally {
            setSrcProgress(null);
            if (srcInputRef.current) srcInputRef.current.value = "";
        }
    };

    /** Выбор файла СКАЧИВАНИЯ (PDF и др.): сразу в Storage, без base64 и без лимита 700 КБ. */
    const handleDownloadFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setDlProgress(0);
        try {
            const url = await uploadFile(file, "documents/files", setDlProgress);
            onChange(index, "downloadUrl", url);
        } catch (error) {
            console.error("Ошибка загрузки файла:", error);
            alert(
                "Не удалось загрузить файл.\n" +
                "Возможные причины: файл больше 20 МБ, неподходящий тип, " +
                "или Storage не включён в консоли Firebase (см. шаг 0)."
            );
        } finally {
            setDlProgress(null);
            if (downloadInputRef.current) downloadInputRef.current.value = "";
        }
    };

    const handleRemoveSrc = () => {
        onChange(index, "src", "");
        if (srcInputRef.current) srcInputRef.current.value = "";
    };

    const handleRemoveDownload = () => {
        onChange(index, "downloadUrl", "");
        if (downloadInputRef.current) downloadInputRef.current.value = "";
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
                    title="Удалить документ"
                >
                    ✕
                </button>
            </div>

            <div className="admin-card__body">
                {/* ============================================
                    ПРЕВЬЮ ИЗОБРАЖЕНИЯ
                    ============================================ */}
                <div className="admin-field">
                    <label className="admin-field__label">Изображение документа</label>

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

                    <input
                        ref={srcInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleSrcFileSelect}
                    />

                    <div className="admin-file-buttons">
                        <button
                            type="button"
                            className="admin-btn admin-btn--file"
                            onClick={() => srcInputRef.current?.click()}
                            disabled={srcProgress !== null}
                        >
                            {srcProgress !== null ? "⏳ Загрузка…" : "📁 Выбрать изображение"}
                        </button>
                        {doc.src && srcProgress === null && (
                            <button
                                type="button"
                                className="admin-btn admin-btn--remove-file"
                                onClick={handleRemoveSrc}
                            >
                                ✕ Убрать
                            </button>
                        )}
                    </div>

                    {srcProgress !== null && (
                        <div className="admin-file-status" style={{ marginTop: "6px" }}>
                            ⏳ Загрузка изображения… {srcProgress}%
                        </div>
                    )}
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
                    ФАЙЛ ДЛЯ СКАЧИВАНИЯ (PDF и др.) — теперь через Storage
                    ============================================ */}
                <div className="admin-field">
                    <label className="admin-field__label">Файл для скачивания (PDF и др.)</label>

                    <div className="admin-file-status">
                        {doc.downloadUrl ? (
                            <span className="admin-file-status__selected">✅ Файл загружен</span>
                        ) : (
                            <span className="admin-file-status__empty">Файл не выбран</span>
                        )}
                    </div>

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
                            disabled={dlProgress !== null}
                        >
                            {dlProgress !== null ? "⏳ Загрузка…" : "📎 Выбрать файл (PDF)"}
                        </button>
                        {doc.downloadUrl && dlProgress === null && (
                            <button
                                type="button"
                                className="admin-btn admin-btn--remove-file"
                                onClick={handleRemoveDownload}
                            >
                                ✕ Убрать
                            </button>
                        )}
                    </div>

                    {dlProgress !== null && (
                        <div className="admin-file-status" style={{ marginTop: "6px" }}>
                            ⏳ Загрузка файла… {dlProgress}%
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDocumentCard;