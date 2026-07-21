// ============================================================
// AdminAnnouncementCard.jsx
// Карточка ОДНОГО объявления в админ-панели.
//
// Визуальный принцип:
//   Карточка выглядит как превью реальной карточки объявления.
//   Сверху — номер и поле "Заголовок" (label).
//   Ниже  — поле "Подзаголовок" (sublabel).
//   Ещё ниже — текстовое поле "Описание" (description).
//   Внизу — кнопка удаления.
//
//   Такое расположение полей = интуитивно понятно:
//   админ видит, где какое поле будет отображаться на сайте.
// ============================================================

const AdminAnnouncementCard = ({ index, item, onChange, onDelete }) => {
    return (
        <div className="admin-card">
            {/* ---- Шапка карточки: номер + кнопка удаления ---- */}
            <div className="admin-card__header">
                <span className="admin-card__number">
                    {String(index + 1).padStart(2, "0")}
                </span>
                <button
                    className="admin-card__delete"
                    onClick={() => onDelete(index)}
                    title="Удалить объявление"
                >
                    ✕
                </button>
            </div>

            {/* ---- Тело карточки: поля ввода ---- */}
            <div className="admin-card__body">
                {/*
                    Поле "Заголовок" (label)
                    Расположено ПЕРВЫМ — так же, как заголовок карточки на сайте.
                */}
                <div className="admin-field">
                    <label className="admin-field__label">Заголовок</label>
                    <input
                        type="text"
                        className="admin-field__input"
                        value={item.label}
                        onChange={(e) => onChange(index, "label", e.target.value)}
                        placeholder="Введите заголовок..."
                    />
                </div>

                {/*
                    Поле "Подзаголовок" (sublabel)
                    Расположено ВТОРЫМ — под заголовком, как на сайте.
                */}
                <div className="admin-field">
                    <label className="admin-field__label">Подзаголовок</label>
                    <input
                        type="text"
                        className="admin-field__input"
                        value={item.sublabel}
                        onChange={(e) => onChange(index, "sublabel", e.target.value)}
                        placeholder="Необязательно..."
                    />
                </div>

                {/*
                    Поле "Описание" (description)
                    Расположено ТРЕТЬИМ — самое большое поле, как текст карточки.
                */}
                <div className="admin-field">
                    <label className="admin-field__label">Описание</label>
                    <textarea
                        className="admin-field__textarea"
                        value={item.description}
                        onChange={(e) => onChange(index, "description", e.target.value)}
                        placeholder="Введите текст объявления..."
                        rows={3}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminAnnouncementCard;