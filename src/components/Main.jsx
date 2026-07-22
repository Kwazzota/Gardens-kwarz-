// ============================================================
// Main.jsx — читает данные из облака Firestore
// ============================================================

import AnnouncementList from "./AnnouncementList";
import { HoverExpand } from "./unlumen-ui/hover-expand";
import { useFirestoreData } from "../hooks/useFirestoreData";
import { defaultItems, defaultDocuments } from "../data/defaultData";

const Main = () => {
    const { data: items, loading: itemsLoading } = useFirestoreData("announcements", defaultItems);
    const { data: documents, loading: docsLoading } = useFirestoreData("documents", defaultDocuments);

    const VISIBLE_ITEMS = 5;
    const ITEM_HEIGHT = 80;

    // Пока данные грузятся из облака
    if (itemsLoading || docsLoading) {
        return (
            <div className="main" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
                <p style={{ color: "#999" }}>Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="main">
            <div
                className="documents__list-wrapper overflow-y-auto custom-scrollbar"
                style={{ maxHeight: `${ITEM_HEIGHT * VISIBLE_ITEMS + 1}px` }}
            >
                <HoverExpand items={items} collapsedHeight={ITEM_HEIGHT} />
            </div>

            <AnnouncementList
                items={documents}
                visibleItems={VISIBLE_ITEMS}
                collapsedHeight={ITEM_HEIGHT}
            />
        </div>
    );
};

export default Main;