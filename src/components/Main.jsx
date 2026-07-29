// ============================================================
// Main.jsx — единый контейнер секций (одна колонка на всех ширинах).
//
// ЧТО ИЗМЕНИЛОСЬ:
//   1) Новости рендерятся ПРЯМО ЗДЕСЬ, первым блоком (импорт News).
//      Раньше News жил отдельно в HomePage и считал ширину в % от
//      экрана → вылезал за контент. Теперь новости, объявления и
//      документы — дети одного .main, поэтому имеют ОДИНАКОВУЮ ширину
//      и отступы автоматически (вылезание исчезает без угадывания CSS).
//   2) Порядок секций: НОВОСТИ → ОБЪЯВЛЕНИЯ → ДОКУМЕНТЫ.
//   3) Одна колонка на всех ширинах задаётся в CSS: .main стал
//      flex-column (см. блок в index.css) — перебивает прежний grid
//      из двух колонок.
// ============================================================

import AnnouncementList from "./AnnouncementList";
import { HoverExpand } from "./unlumen-ui/hover-expand";
import News from "./News";
import { useFirestoreData } from "../hooks/useFirestoreData";
import { defaultItems, defaultDocuments } from "../data/defaultData";

const Main = () => {
    const { data: items, loading: itemsLoading } =
        useFirestoreData("announcements", defaultItems);
    const { data: documents, loading: docsLoading } =
        useFirestoreData("documents", defaultDocuments);

    const VISIBLE_ITEMS = 5;
    const ITEM_HEIGHT = 80;

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
            {/* 1) НОВОСТИ — первый блок (ширина = ширине .main) */}
            <News />

            {/* 2) ОБЪЯВЛЕНИЯ */}
            <div
                className="documents__list-wrapper overflow-y-auto custom-scrollbar"
                style={{ maxHeight: `${ITEM_HEIGHT * VISIBLE_ITEMS + 1}px` }}
            >
                <HoverExpand items={items} collapsedHeight={ITEM_HEIGHT} />
            </div>

            {/* 3) ДОКУМЕНТЫ */}
            <AnnouncementList
                items={documents}
                visibleItems={VISIBLE_ITEMS}
                collapsedHeight={ITEM_HEIGHT}
            />
        </div>
    );
};

export default Main;