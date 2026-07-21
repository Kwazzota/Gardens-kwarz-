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
                        <h3 className="announcement-item__title">{item.label}</h3>
                        {item.sublabel && (
                            <p className="announcement-item__sublabel">{item.sublabel}</p>
                        )}

                        {/* Кнопки для просмотра и скачивания документа */}
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