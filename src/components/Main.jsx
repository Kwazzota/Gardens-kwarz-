// ============================================================
// Main.jsx — читает данные из облака Firestore
//
// ЧТО ИЗМЕНИЛОСЬ:
//   УБРАН <HoverExpand> для объявлений. Он раскрывал текст только
//   при наведении мыши (через абсолютное позиционирование), из-за
//   чего: не работал скролл, текст обрезался справа, а на телефоне
//   полный текст было не прочитать. Теперь объявления — обычный
//   список: номер + заголовок + подзаголовок + ВЕСЬ текст описания.
//   Документы ниже — без изменений.
// ============================================================

import AnnouncementList from "./AnnouncementList";
import { useFirestoreData } from "../hooks/useFirestoreData";
import { defaultItems, defaultDocuments } from "../data/defaultData";

const Main = () => {
    const { data: items, loading: itemsLoading } =
        useFirestoreData("announcements", defaultItems);
    const { data: documents, loading: docsLoading } =
        useFirestoreData("documents", defaultDocuments);

    const VISIBLE_ITEMS = 5;
    const ITEM_HEIGHT = 80;

    // Пока данные грузятся из облака
    if (itemsLoading || docsLoading) {
        return (
            <div
                className="main"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "300px",
                }}
            >
                <p style={{ color: "#999" }}>Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="main">
            {/* ============================================
                ОБЪЯВЛЕНИЯ — простой список, ВЕСЬ текст,
                рабочий вертикальный скролл.
                ============================================ */}
            <div
                className="documents__list-wrapper overflow-y-auto custom-scrollbar"
                style={{ maxHeight: `${ITEM_HEIGHT * VISIBLE_ITEMS + 1}px` }}
            >
                <div className="announcement-list">
                    {items.map((item, index) => (
                        <div key={index} className="announcement-item">
                            <div className="announcement-item__number">
                                {String(index + 1).padStart(2, "0")}
                            </div>

                            <div className="announcement-item__content">
                                <h3 className="announcement-item__title">
                                    {item.label}
                                </h3>

                                {item.sublabel && (
                                    <p className="announcement-item__sublabel">
                                        {item.sublabel}
                                    </p>
                                )}

                                {/* ПОЛНЫЙ текст объявления — без обрезки */}
                                {item.description && (
                                    <p className="announcement-item__description">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ============================================
                ДОКУМЕНТЫ — без изменений
                ============================================ */}
            <AnnouncementList
                items={documents}
                visibleItems={VISIBLE_ITEMS}
                collapsedHeight={ITEM_HEIGHT}
            />
        </div>
    );
};

export default Main;