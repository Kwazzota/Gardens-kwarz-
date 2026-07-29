// ============================================================
// Main.jsx — единый контейнер секций (одна колонка на всех ширинах).
//
// ПОРЯДОК: НОВОСТИ → ОБЪЯВЛЕНИЯ → ДОКУМЕНТЫ.
//
// ЧТО ДОБАВЛЕНО (чек-лист):
//   Каждая секция обёрнута в <section className="main-section"> с
//   заголовком <h2 className="main-section__title">. Заголовки живут
//   НАД панелями и ВНЕ их скролла (не скроллятся, не съедают maxHeight).
//   Вертикальные отступы между секциями ведёт .main-section (padding-block),
//   см. CSS в main.css.
//
// Адаптивная высота свёрнутой карточки (itemHeight) — как было:
//   ≤525px → 130px, иначе → 80px (matchMedia + подписка).
// ============================================================

import { useState, useEffect } from "react";
import AnnouncementList from "./AnnouncementList";
import { HoverExpand } from "./unlumen-ui/hover-expand";
import News from "./News";
import { useFirestoreData } from "../hooks/useFirestoreData";
import { defaultItems, defaultDocuments } from "../data/defaultData";

const getItemHeight = () =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 590px)").matches
        ? 160
        : 80;

const Main = () => {
    const { data: items, loading: itemsLoading } =
        useFirestoreData("announcements", defaultItems);
    const { data: documents, loading: docsLoading } =
        useFirestoreData("documents", defaultDocuments);

    const [itemHeight, setItemHeight] = useState(getItemHeight);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 590px)");
        const onChange = () => setItemHeight(getItemHeight());
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    const VISIBLE_ITEMS = 5;

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
            {/* 1) НОВОСТИ */}
            <section className="main-section">
                <h2 className="main-section__title">Новости</h2>
                <News />
            </section>

            {/* 2) ОБЪЯВЛЕНИЯ */}
            <section className="main-section">
                <h2 className="main-section__title">Объявления</h2>
                <div
                    className="documents__list-wrapper overflow-y-auto custom-scrollbar"
                    style={{ maxHeight: `${itemHeight * VISIBLE_ITEMS + 1}px` }}
                >
                    <HoverExpand items={items} collapsedHeight={itemHeight} />
                </div>
            </section>

            {/* 3) ДОКУМЕНТЫ */}
            <section className="main-section">
                <h2 className="main-section__title">Документы</h2>
                <AnnouncementList
                    items={documents}
                    visibleItems={VISIBLE_ITEMS}
                    collapsedHeight={itemHeight}
                />
            </section>
        </div>
    );
};

export default Main;