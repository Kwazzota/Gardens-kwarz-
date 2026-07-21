// ============================================================
// Main.jsx
// Основной контент главной страницы.
//
// ЧТО ИЗМЕНИЛОСЬ:
//   Раньше массивы items и documents были захардкожены здесь.
//   Теперь они читаются из localStorage через useLocalStorageData.
//   Это значит: если админ изменил данные — они сразу видны здесь.
// ============================================================

import AnnouncementList from "./AnnouncementList";
import { HoverExpand } from "./unlumen-ui/hover-expand";
import { useLocalStorageData } from "../hooks/useLocalStorageData";
import { defaultItems, defaultDocuments } from "../data/defaultData";

const Main = () => {
    // Читаем актуальные данные из localStorage.
    // Ключ "app_items" — для объявлений, "app_documents" — для документов.
    // Если localStorage пуст — подставятся defaultItems / defaultDocuments.
    const { data: items } = useLocalStorageData("app_items", defaultItems);
    const { data: documents } = useLocalStorageData("app_documents", defaultDocuments);

    const VISIBLE_ITEMS = 5;
    const ITEM_HEIGHT = 80;

    return (
        <div className="main">
            {/* Левая колонка — объявления (HoverExpand) */}
            <div
                className="documents__list-wrapper overflow-y-auto custom-scrollbar"
                style={{ maxHeight: `${ITEM_HEIGHT * VISIBLE_ITEMS + 1}px` }}
            >
                <HoverExpand
                    items={items}
                    collapsedHeight={ITEM_HEIGHT}
                />
            </div>

            {/* Правая колонка — документы (AnnouncementList) */}
            <AnnouncementList
                items={documents}
                visibleItems={VISIBLE_ITEMS}
                collapsedHeight={ITEM_HEIGHT}
            />
        </div>
    );
};

export default Main;