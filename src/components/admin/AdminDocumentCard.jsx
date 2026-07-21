// ============================================================
// AdminDocumentCard.jsx
// Карточка ОДНОГО документа в админ-панели.
//
// ЧТО ИЗМЕНИЛОСЬ:
//   Поля src и downloadUrl заменены на <input type="file">.
//   Пользователь НАЖИМАЕТ КНОПКУ → открывается проводник Windows/Mac →
//   выбирает файл → файл конвертируется в base64 → сохраняется.
//
//   Это сделано для людей, не знакомых с компьютером:
//   им не нужно вводить путь к файлу вручную.
//
// КАК РАБОТАЕТ КОНВЕРТАЦИЯ:
//   1. Пользователь выбирает файл через проводник.
//   2. FileReader.readAsDataURL() читает файл и превращает его
//      в строку вида "data:image/png;base64,iVBORw0KGgo..."
//   3. Эта строка сохраняется в localStorage как значение src.
//   4. На главной странице <img src="data:image/png;base64,...">
//      отображает картинку без обращения к серверу.
//
// ОГРАНИЧЕНИЕ:
//   localStorage вмещает ~5-10 МБ на весь сайт.
//   Одна картинка в base64 занимает в ~1.37 раза больше, чем файл.
//   Т.е. картинка 3 МБ → в localStorage ~4 МБ.
//   Если нужно больше — в будущем понадобится бэкенд.
// ============================================================

import { useRef } from "react";

const AdminDocumentCard = ({ index, doc, onChange, onDelete }) => {
    // Ссылки на скрытые input[type="file"].
    // Нужны, чтобы по нажатию на красивую кнопку открывался проводник.
    const srcInputRef = useRef(null);
    const downloadInputRef = useRef(null);

    /**
     * Обработчик выбора файла для ПРЕВЬЮ (src).
     * Вызывается когда пользователь выбрал файл в проводнике.
     */
    const handleSrcFileSelect = (e) => {
        const file = e.target.files[0]; // Берём первый выбранный файл
        if (!file) return;

        // Проверяем, что это изображение
        if (!file.type.startsWith("image/")) {
            alert("Пожалуйста, выберите файл изображения (PNG, JPG, GIF и т.д.)");
            return;
        }

        // Проверяем размер (максимум 4 МБ, чтобы влезло в localStorage)
        if (file.size > 4 * 1024 * 1024) {
            alert("Файл слишком большой. Максимум 4 МБ.");
            return;
        }

        // FileReader читает файл и конвертирует в base64-строку
        const reader = new FileReader();
        reader.onload = (event) => {
            // event.target.result = "data:image/png;base64,iVBORw0KGgo..."
            // Сохраняем эту строку как src
            onChange(index, "src", event.target.result);
        };
        reader.readAsDataURL(file); // Запускаем чтение
    };

    /**
     * Обработчик выбора файла для СКАЧИВАНИЯ (downloadUrl).
     * Может быть любой файл (PDF, DOCX, PNG и т.д.)
     */
    const handleDownloadFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Проверяем размер (максимум 4 МБ)
        if (file.size > 4 * 1024 * 1024) {
            alert("Файл слишком большой. Максимум 4 МБ.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            onChange(index, "downloadUrl", event.target.result);
        };
        reader.readAsDataURL(file);
    };

    /**
     * Удалить выбранное изображение (сбросить src).
     */
    const handleRemoveSrc = () => {
        onChange(index, "src", "");
        // Очищаем input, чтобы можно было выбрать тот же файл повторно
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