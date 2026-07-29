// ============================================================
// AdminDocumentCard.jsx — карточка документа.
//
// РЕЖИМ БЕЗ FIREBASE STORAGE. Поле «Файл документа» (downloadUrl)
// поддерживает ДВА способа (договорённость с заказчиком):
//   1) ОДНОСТРАНИЧНЫЙ документ-изображение (JPG/PNG) — загружают
//      ЗАКАЗЧИКИ кнопкой: сжатие compressImage → base64 в downloadUrl.
//   2) МНОГОСТРАНИЧНЫЙ PDF — загружает РАЗРАБОТЧИК: кладёт файл в
//      папку public/ и вписывает сюда его имя (напр. protocol-48.pdf).
//      На сайте путь соберётся автоматически (см. Document.jsx).
//
// Превью-обложка (src) — отдельная кнопка загрузки картинки (base64),
// как раньше. Storage и лимит 700 КБ больше не используются.
//
// Чтобы не было путаницы, когда в downloadUrl уже лежит картинка
// (base64), текстовое поле для PDF скрывается — сначала надо убрать
// изображение. И наоборот: если указан PDF-путь, картинка не грузится.
// ============================================================

import { useRef } from "react";
import { compressImage } from "../../utils/compressImage";

const AdminDocumentCard = ({ index, doc, onChange, onDelete }) => {
    const srcInputRef = useRef(null);     // превью-обложка
    const docImgInputRef = useRef(null);  // документ-изображение (JPG/PNG)

    // В downloadUrl сейчас картинка (base64)? От этого зависит вид блока «Файл документа».
    const downloadIsImage =
        typeof doc.downloadUrl === "string" && doc.downloadUrl.startsWith("data:image");

    /** Превью-обложка: сжатие → base64 в src. */
    const handleSrcFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Пожалуйста, выберите файл изображения (PNG, JPG, GIF и т.д.)");
            return;
        }
        try {
            const b64 = await compressImage(file, 1400, 0.8);
            onChange(index, "src", b64);
        } catch (error) {
            console.error("Ошибка сжатия изображения:", error);
            alert("Не удалось обработать изображение. Попробуйте другой файл.");
        } finally {
            if (srcInputRef.current) srcInputRef.current.value = "";
        }
    };

    /** Документ-изображение (одностраничный, JPG/PNG): сжатие → base64 в downloadUrl. */
    const handleDocImgSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert(
                "Кнопкой можно загрузить документ-изображение (JPG/PNG).\n" +
                "Многостраничный PDF положите в папку public/ и впишите его имя в поле ниже."
            );
            return;
        }
        try {
            // Чуть выше ширина/качество, чем у превью, чтобы текст документа был читаем.
            const b64 = await compressImage(file, 1600, 0.85);
            onChange(index, "downloadUrl", b64);
        } catch (error) {
            console.error("Ошибка сжатия изображения:", error);
            alert("Не удалось обработать изображение. Попробуйте другой файл.");
        } finally {
            if (docImgInputRef.current) docImgInputRef.current.value = "";
        }
    };

    const handleRemoveSrc = () => {
        onChange(index, "src", "");
        if (srcInputRef.current) srcInputRef.current.value = "";
    };

    const handleRemoveDownload = () => {
        onChange(index, "downloadUrl", "");
        if (docImgInputRef.current) docImgInputRef.current.value = "";
    };

    return (
        <div className="admin-card admin-card--document">
            {/* ---- Шапка: номер + удаление ---- */}
            <div className="admin-card__header">
                <span className="admin-card__number">{String(index + 1).padStart(2, "0")}</span>
                <button className="admin-card__delete" onClick={() => onDelete(index)} title="Удалить документ">
                    ✕
                </button>
            </div>

            <div className="admin-card__body">
                {/* ============================================
                    ПРЕВЬЮ-ОБЛОЖКА (src, кнопка, base64)
                    ============================================ */}
                <div className="admin-field">
                    <label className="admin-field__label">Превью (обложка документа)</label>
                    <div className="admin-image-preview">
                        {doc.src ? (
                            <img src={doc.src} alt={doc.alt || "Превью"} className="admin-image-preview__img" />
                        ) : (
                            <div className="admin-image-preview__placeholder">🖼️ Изображение не выбрано</div>
                        )}
                    </div>
                    <input ref={srcInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleSrcFileSelect} />
                    <div className="admin-file-buttons">
                        <button type="button" className="admin-btn admin-btn--file" onClick={() => srcInputRef.current?.click()}>
                            📁 Выбрать изображение
                        </button>
                        {doc.src && (
                            <button type="button" className="admin-btn admin-btn--remove-file" onClick={handleRemoveSrc}>
                                ✕ Убрать
                            </button>
                        )}
                    </div>
                </div>

                {/* ---- Заголовок ---- */}
                <div className="admin-field">
                    <label className="admin-field__label">Заголовок</label>
                    <input type="text" className="admin-field__input" value={doc.label}
                           onChange={(e) => onChange(index, "label", e.target.value)} placeholder="Название документа..." />
                </div>

                {/* ---- Подзаголовок ---- */}
                <div className="admin-field">
                    <label className="admin-field__label">Подзаголовок</label>
                    <input type="text" className="admin-field__input" value={doc.sublabel}
                           onChange={(e) => onChange(index, "sublabel", e.target.value)} placeholder="Необязательно..." />
                </div>

                {/* ---- Описание ---- */}
                <div className="admin-field">
                    <label className="admin-field__label">Описание</label>
                    <textarea className="admin-field__textarea" value={doc.description}
                              onChange={(e) => onChange(index, "description", e.target.value)} placeholder="Описание документа..." rows={3} />
                </div>

                {/* ---- Alt ---- */}
                <div className="admin-field">
                    <label className="admin-field__label">Alt-текст (для доступности)</label>
                    <input type="text" className="admin-field__input" value={doc.alt}
                           onChange={(e) => onChange(index, "alt", e.target.value)} placeholder="Описание картинки..." />
                </div>

                {/* ============================================
                    ФАЙЛ ДОКУМЕНТА (downloadUrl) — ДВА способа
                    ============================================ */}
                <div className="admin-field">
                    <label className="admin-field__label">Файл документа</label>
                    <p style={{ fontSize: "12px", lineHeight: 1.45, opacity: 0.7, margin: "0 0 8px" }}>
                        Одностраничный документ, переведённый в <b>JPG/PNG</b>, — загрузите кнопкой.
                        Многостраничный <b>PDF</b> — положите в папку <b>public/</b> (имя латиницей,
                        без пробелов) и впишите его имя в поле.
                    </p>

                    {downloadIsImage ? (
                        /* ---- Сейчас в downloadUrl картинка (загружена кнопкой) ---- */
                        <>
                            <div className="admin-image-preview">
                                <img src={doc.downloadUrl} alt="Документ" className="admin-image-preview__img" />
                            </div>
                            <div className="admin-file-status" style={{ marginTop: "6px" }}>
                                <span className="admin-file-status__selected">✅ Загружено изображение-документ</span>
                            </div>
                            <div className="admin-file-buttons" style={{ marginTop: "6px" }}>
                                <button type="button" className="admin-btn admin-btn--remove-file" onClick={handleRemoveDownload}>
                                    ✕ Убрать изображение
                                </button>
                            </div>
                            <p style={{ fontSize: "12px", opacity: 0.6, margin: "6px 0 0" }}>
                                Чтобы указать PDF вместо изображения — сначала уберите изображение.
                            </p>
                        </>
                    ) : (
                        /* ---- Сейчас в downloadUrl пусто или PDF-путь ---- */
                        <>
                            {/* Способ 1: документ-изображение кнопкой */}
                            <input ref={docImgInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleDocImgSelect} />
                            <div className="admin-file-buttons">
                                <button type="button" className="admin-btn admin-btn--file" onClick={() => docImgInputRef.current?.click()}>
                                    📁 Загрузить изображение (JPG/PNG)
                                </button>
                            </div>

                            {/* Способ 2: имя PDF из public/ */}
                            <label className="admin-field__label" style={{ marginTop: "10px" }}>
                                или имя PDF из public/
                            </label>
                            <input
                                type="text"
                                className="admin-field__input"
                                value={doc.downloadUrl || ""}
                                onChange={(e) => onChange(index, "downloadUrl", e.target.value.trim())}
                                placeholder="protocol-48.pdf"
                            />

                            <div className="admin-file-status" style={{ marginTop: "6px" }}>
                                {doc.downloadUrl ? (
                                    <span className="admin-file-status__selected">✅ Указан файл: {doc.downloadUrl}</span>
                                ) : (
                                    <span className="admin-file-status__empty">Файл не указан</span>
                                )}
                            </div>

                            {doc.downloadUrl && (
                                <div className="admin-file-buttons" style={{ marginTop: "6px" }}>
                                    <button type="button" className="admin-btn admin-btn--remove-file" onClick={handleRemoveDownload}>
                                        ✕ Убрать файл
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDocumentCard;