// ============================================================
// Main.jsx — читает данные из облака Firestore
//
// ЧТО ДОБАВЛЕНО:
//   Высота свёрнутой карточки (itemHeight) теперь АДАПТИВНАЯ:
//     - экран шире 525px  → 80px  (как было);
//     - экран <= 525px    → 130px (заголовок на мобилках переносится
//                                  на 2 строки, 80px не хватало).
//   Реализовано через window.matchMedia + подписку на изменение,
//   потому что высота передаётся в компонент ПРОПСОМ collapsedHeight
//   и попадает в инлайн-style — CSS-ом через @media это не поменять,
//   не сломав раскрытое состояние.
//   itemHeight идёт и в HoverExpand, и в AnnouncementList, и в
//   maxHeight обёртки — поэтому всё пересчитывается согласованно.
// ============================================================

import { useState, useEffect } from "react";
import AnnouncementList from "./AnnouncementList";
import { HoverExpand } from "./unlumen-ui/hover-expand";
import { useFirestoreData } from "../hooks/useFirestoreData";
import { defaultItems, defaultDocuments } from "../data/defaultData";

// Высота ОДНОЙ свёрнутой карточки в зависимости от ширины экрана.
const getItemHeight = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 525px)").matches
        ? 130
        : 80;

const Main = () => {
    const { data: items, loading: itemsLoading } =
        useFirestoreData("announcements", defaultItems);
    const { data: documents, loading: docsLoading } =
        useFirestoreData("documents", defaultDocuments);

    // Текущая высота свёрнутой карточки (80 или 130).
    const [itemHeight, setItemHeight] = useState(getItemHeight);

    // Подписка: при переходе через границу 525px (ресайз / поворот
    // телефона) пересчитываем высоту.
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 525px)");
        const onChange = () => setItemHeight(getItemHeight());
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    const VISIBLE_ITEMS = 4;

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
            <div
                className="documents__list-wrapper overflow-y-auto custom-scrollbar"
                style={{ maxHeight: `${itemHeight * VISIBLE_ITEMS + 1}px` }}
            >
                <HoverExpand items={items} collapsedHeight={itemHeight} />
            </div>

            <AnnouncementList
                items={documents}
                visibleItems={VISIBLE_ITEMS}
                collapsedHeight={itemHeight}
            />
        </div>
    );
};

export default Main;