import AnnouncementList from "./AnnouncementList";
import {HoverExpand} from "./unlumen-ui/hover-expand";

const Main = () => {
    const items = [
        {
            label: "Объявление 1",
            sublabel: "",
            description: "Текст первого объявления",
        },
        {
            label: "Объявление 2",
            sublabel: "",
            description: "Текст второго объявления",
        },
        {
            label: "Объявление 3",
            sublabel: "",
            description: "Текст третьего объявления",
        },
        {
            label: "Объявление 4",
            sublabel: "",
            description: "Текст четвёртого объявления",
        },
        {
            label: "Объявление 5",
            sublabel: "",
            description: "Текст пятого объявления",
        },
        {
            label: "Объявление 6",
            sublabel: "",
            description: "Текст шестого объявления (видно только при скролле)",
        },
        {
            label: "Объявление 7",
            sublabel: "",
            description: "Текст седьмого объявления (видно только при скролле)",
        },
        {
            label: "Объявление 8",
            sublabel: "",
            description: "Текст восьмого объявления (видно только при скролле)",
        },

    ]

    const documents = [
        {
            label: "Документ 1",
            sublabel: "",
            description: "Текст первого объявления",
            src: "src/assets/images/documents/img.png",
            alt: "Документ 1",
            downloadUrl: "src/assets/images/documents/img.png", // URL для скачивания
        },
        {
            label: "Документ 2",
            sublabel: "",
            description: "Текст второго объявления",
            src: "src/assets/images/documents/doc2.png",
            alt: "Документ 2",
            downloadUrl: "src/assets/images/documents/img.png",
        },
        {
            label: "Документ 3",
            sublabel: "",
            description: "Текст третьего объявления",
            src: "src/assets/images/documents/doc3.png",
            alt: "Документ 3",
            downloadUrl: "src/assets/images/documents/img.png",
        },
        {
            label: "Документ 4",
            sublabel: "",
            description: "Текст четвёртого объявления",
            src: "src/assets/images/documents/doc4.png",
            alt: "Документ 4",
            downloadUrl: "src/assets/images/documents/img.png",
        },
        {
            label: "Документ 5",
            sublabel: "",
            description: "Текст пятого объявления",
            src: "src/assets/images/documents/doc5.png",
            alt: "Документ 5",
            downloadUrl: "src/assets/images/documents/img.png",
        },
        {
            label: "Документ 6",
            sublabel: "",
            description: "Текст шестого объявления",
            src: "src/assets/images/documents/doc6.png",
            alt: "Документ 6",
            downloadUrl: "src/assets/images/documents/img.png",
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


