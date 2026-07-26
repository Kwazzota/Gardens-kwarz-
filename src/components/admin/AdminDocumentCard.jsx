// ============================================================
// AdminDocumentCard.jsx — карточка документа (задача 4 + диагностика).
//
// ЧТО ДОБАВЛЕНО:
//   Состояния srcError / dlError — текст ошибки загрузки теперь виден
//   ПРЯМО В КАРТОЧКЕ красной строкой (а не только в alert, который
//   легко пропустить). Ошибка очищается при следующей попытке загрузки.
//   Это нужно, чтобы при зависании на 0% сразу видеть код причины
//   (storage/unauthorized, storage/bucket-not-found, storage/network…).
// Загрузка превью и PDF через Storage — без изменений по логике.
// ============================================================

import { useRef, useState } from "react";
import { compressImage } from "../../utils/compressImage";
import { uploadFile } from "../../utils/uploadToStorage";

// Человекочитаемый перевод кодов ошибок Storage (показываем в карточке).
const humanizeError = (error) => {
    const code = error?.code || "";
    if (code.includes("unauthorized") || code.includes("permission"))
        return "Нет прав на запись. Опубликуйте правила Storage (шаг 0).";
    if (code.includes("bucket") || code.includes("not-initialized") || code.includes("not-found"))
        return "Storage не включён в консоли Firebase (шаг 0).";
    if (code.includes("network") || code.includes("canceled"))
        return "Проблема со связью со Storage. Проверьте интернет / блокировщики.";
    if (code.includes("too-large") || code.includes("size"))
        return "Файл больше разрешённого размера (20 МБ).";
    return error?.message || "Неизвестная ошибка загрузки.";
};

const AdminDocumentCard = ({ index, doc, onChange, onDelete }) => {
    const srcInputRef = useRef(null);
    const downloadInputRef = useRef(null);

    const [srcProgress, setSrcProgress] = useState(null);
    const [dlProgress, setDlProgress] = useState(null);
    const [srcError, setSrcError] = useState(null);
    const [dlError, setDlError] = useState(null);

    /** Превью: сжатие → Storage → ссылка. */
    const handleSrcFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setSrcError("Нужен файл изображения (PNG, JPG, GIF…).");
            return;
        }
        setSrcProgress(0);
        setSrcError(null);
        try {
            const compressedDataUrl = await compressImage(file, 1400, 0.8);
            const blob = await (await fetch(compressedDataUrl)).blob();
            const baseName = (file.name || "image").replace(/\.[^.]+$/, "");
            const jpg = new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
            const url = await uploadFile(jpg, "documents/images", setSrcProgress);
            onChange(index, "src", url);
        } catch (error) {
            console.error("Ошибка загрузки изображения:", error);
            setSrcError(humanizeError(error));
        } finally {
            setSrcProgress(null);
            if (srcInputRef.current) srcInputRef.current.value = "";
        }
    };

    /** Файл скачивания (PDF и др.): сразу в Storage. */
    const handleDownloadFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setDlProgress(0);
        setDlError(null);
        try {
            const url = await uploadFile(file, "documents/files", setDlProgress);
            onChange(index, "downloadUrl", url);
        } catch (error) {
            console.error("Ошибка загрузки файла:", error);
            setDlError(humanizeError(error));
        } finally {
            setDlProgress(null);
            if (downloadInputRef.current) downloadInputRef.current.value = "";
        }
    };

    const handleRemoveSrc = () => {
        onChange(index, "src", "");
        setSrcError(null);
        if (srcInputRef.current) srcInputRef.current.value = "";
    };

    const handleRemoveDownload = () => {
        onChange(index, "downloadUrl", "");
        setDlError(null);
        if (downloadInputRef.current) downloadInputRef.current.value = "";
    };

    return (
        <div className="admin-card admin-card--document">
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
                {/* ПРЕВЬЮ */}
                <div className="admin-field">
                    <label className="admin-field__label">Изображение документа</label>
                    <div className="admin-image-preview">
                        {doc.src ? (
                            <img src={doc.src} alt={doc.alt || "Превью"} className="admin-image-preview__img" />
                        ) : (
                            <div className="admin-image-preview__placeholder">🖼️ Изображение не выбрано</div>
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
                            <button type="button" className="admin-btn admin-btn--remove-file" onClick={handleRemoveSrc}>
                                ✕ Убрать
                            </button>
                        )}
                    </div>
                    {srcProgress !== null && (
                        <div className="admin-file-status" style={{ marginTop: "6px" }}>⏳ Загрузка изображения… {srcProgress}%</div>
                    )}
                    {srcError && (
                        <div className="admin-file-status" style={{ marginTop: "6px", color: "#c0392b", fontWeight: 600 }}>
                            ⚠️ {srcError}
                        </div>
                    )}
                </div>

                {/* Заголовок */}
                <div className="admin-field">
                    <label className="admin-field__label">Заголовок</label>
                    <input type="text" className="admin-field__input" value={doc.label}
                           onChange={(e) => onChange(index, "label", e.target.value)} placeholder="Название документа..." />
                </div>

                {/* Подзаголовок */}
                <div className="admin-field">
                    <label className="admin-field__label">Подзаголовок</label>
                    <input type="text" className="admin-field__input" value={doc.sublabel}
                           onChange={(e) => onChange(index, "sublabel", e.target.value)} placeholder="Необязательно..." />
                </div>

                {/* Описание */}
                <div className="admin-field">
                    <label className="admin-field__label">Описание</label>
                    <textarea className="admin-field__textarea" value={doc.description}
                              onChange={(e) => onChange(index, "description", e.target.value)} placeholder="Описание документа..." rows={3} />
                </div>

                {/* Alt */}
                <div className="admin-field">
                    <label className="admin-field__label">Alt-текст (для доступности)</label>
                    <input type="text" className="admin-field__input" value={doc.alt}
                           onChange={(e) => onChange(index, "alt", e.target.value)} placeholder="Описание картинки..." />
                </div>

                {/* ФАЙЛ СКАЧИВАНИЯ */}
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
                            <button type="button" className="admin-btn admin-btn--remove-file" onClick={handleRemoveDownload}>
                                ✕ Убрать
                            </button>
                        )}
                    </div>
                    {dlProgress !== null && (
                        <div className="admin-file-status" style={{ marginTop: "6px" }}>⏳ Загрузка файла… {dlProgress}%</div>
                    )}
                    {dlError && (
                        <div className="admin-file-status" style={{ marginTop: "6px", color: "#c0392b", fontWeight: 600 }}>
                            ⚠️ {dlError}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDocumentCard;