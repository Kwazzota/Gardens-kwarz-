// ============================================================
// AnnouncementList.jsx
//
// ЧТО ИЗМЕНИЛОСЬ:
//   Раньше label и sublabel могли отображаться в одну строку
//   через двоеточие (зависит от CSS).
//   Теперь:
//     - label и sublabel ВСЕГДА на отдельных строках.
//     - Никакого двоеточия между ними.
//     - sublabel отображается только если он НЕ пустой.
// ============================================================

import { useState } from "react";
import Document from "./Document";

const AnnouncementList = ({ items, visibleItems = 5, collapsedHeight = 80 }) => {
    const [activeIndex, setActiveIndex] = useState(null);

    return (
        <div
            className="announcement-list custom-scrollbar"
            style={{ maxHeight: `${collapsedHeight * visibleItems}px` }}
        >
            {items.map((item, index) => (
                <div
                    key={index}
                    className="announcement-item"
                    style={{ minHeight: `${collapsedHeight}px` }}
                >
                    <div className="announcement-item__number">
                        {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="announcement-item__content">
                        {/*
                            Заголовок (label) — на ПЕРВОЙ строке.
                            Подзаголовок (sublabel) — на ВТОРОЙ строке.
                            Между ними НЕТ двоеточия.
                            Каждый элемент — блочный (display: block),
                            поэтому они автоматически на разных строках.
                        */}
                        <h3 className="announcement-item__title">
                            {item.label}
                        </h3>

                        {/* sublabel показываем только если он не пустой */}
                        {item.sublabel && (
                            <p className="announcement-item__sublabel">
                                {item.sublabel}
                            </p>
                        )}

                        {/* Кнопки просмотра/скачивания документа */}
                        {item.src && (
                            <Document
                                src={item.src}
                                alt={item.alt || item.label}
                                downloadUrl={item.downloadUrl || item.src}
                                className="announcement-item__document"
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AnnouncementList;