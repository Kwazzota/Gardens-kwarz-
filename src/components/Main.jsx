import AnnouncementList from "./AnnouncementList";
import { HoverExpand } from "./unlumen-ui/hover-expand";

const Main = () => {
    const items = [
        { label: "Объявление 1", sublabel: "", description: "Текст первого объявления" },
        { label: "Объявление 2", sublabel: "", description: "Текст второго объявления" },
        { label: "Объявление 3", sublabel: "", description: "Текст третьего объявления" },
        { label: "Объявление 4", sublabel: "", description: "Текст четвёртого объявления" },
        { label: "Объявление 5", sublabel: "", description: "Текст пятого объявления" },
        { label: "Объявление 6", sublabel: "", description: "Текст шестого объявления (видно только при скролле)" },
        { label: "Объявление 7", sublabel: "", description: "Текст седьмого объявления (видно только при скролле)" },
        { label: "Объявление 8", sublabel: "", description: "Текст восьмого объявления (видно только при скролле)" },
    ];

    const BASE = import.meta.env.BASE_URL; // автоматически подставит "/Gardens-kwarz-/"

    const documents = [
        {
            label: "Документ 1",
            src: `${BASE}documents/img.png`,
            downloadUrl: `${BASE}documents/img.png`,
            alt: "Документ 1",
        },
        {
            label: "Документ 2",
            src: `${BASE}documents/img.png`,
            downloadUrl: `${BASE}documents/img.png`,
            alt: "Документ 2",
        },
        {
            label: "Документ 3",
            src: `${BASE}documents/img.png`,
            downloadUrl: `${BASE}documents/img.png`,
            alt: "Документ 3",
        },
        {
            label: "Документ 4",
            src: `${BASE}documents/img.png`,
            downloadUrl: `${BASE}documents/img.png`,
            alt: "Документ 4",
        },
        {
            label: "Документ 5",
            src: `${BASE}documents/img.png`,
            downloadUrl: `${BASE}documents/img.png`,
            alt: "Документ 5",
        },
        {
            label: "Документ 6",
            src: `${BASE}documents/img.png`,
            downloadUrl: `${BASE}documents/img.png`,
            alt: "Документ 6",
        },
        {
            label: "Документ 7",
            src: `${BASE}documents/img.png`,
            downloadUrl: `${BASE}documents/img.png`,
            alt: "Документ 7",
        },
        {
            label: "Документ 8",
            src: `${BASE}documents/img.png`,
            downloadUrl: `${BASE}documents/img.png`,
            alt: "Документ 8",
        },
    ];

    const VISIBLE_ITEMS = 5;
    const ITEM_HEIGHT = 80;

    return (
        <div className="main">
            <div
                className="documents__list-wrapper overflow-y-auto custom-scrollbar"
                style={{ maxHeight: `${ITEM_HEIGHT * VISIBLE_ITEMS + 1}px` }}
            >
                <HoverExpand
                    items={items}
                    collapsedHeight={ITEM_HEIGHT}
                />
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