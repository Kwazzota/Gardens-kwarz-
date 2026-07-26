// ============================================================
// Document.jsx — кнопки «Просмотр / Скачать» + модалка (задача 4).
//
// ЧТО ИЗМЕНИЛОСЬ:
//   1) handleDownload различает два формата downloadUrl:
//        - https://… (новая ссылка из Storage) → window.open во вкладке;
//          браузер сам покажет PDF во встроенном просмотрщике или скачает.
//          Принудительное <a download> для cross-origin НЕ работает,
//          поэтому для внешних ссылок используем открытие во вкладке.
//        - data:… (старый base64) → прежняя логика принудительного скачивания.
//   2) Кнопка «Просмотр» показывается только если есть превью (src) —
//      иначе (документ только с PDF, без картинки) модалке нечего показать.
//   3) <img> в модалке ограничен экраном (max-h-[80vh]) — фикс центрирования.
// ============================================================

import { Button } from "./ui/button";
import BasicModal from "./ui/smoothui/basic-modal";
import { useState } from "react";

const Document = (props) => {
    const {
        src,
        alt = "",
        className,
        buttonLabel = "Просмотр документа",
        downloadUrl,
        downloadLabel = "Скачать документ",
    } = props;

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDownload = () => {
        if (!downloadUrl) return;

        if (/^https?:\/\//i.test(downloadUrl)) {
            // Ссылка из Storage — открываем во вкладке (PDF откроется в просмотрщике).
            window.open(downloadUrl, "_blank", "noopener");
        } else {
            // Старый base64 — принудительное скачивание.
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = true;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <>
            <div className={`documents__buttons ${className || ""}`}>
                {/* Просмотр — только если есть превью-картинка */}
                {src && (
                    <Button
                        className="documents__button documents__button--view"
                        onClick={() => setIsModalOpen(true)}
                    >
                        {buttonLabel}
                    </Button>
                )}

                {downloadUrl && (
                    <Button
                        className="documents__button documents__button--download"
                        onClick={handleDownload}
                    >
                        {downloadLabel}
                    </Button>
                )}
            </div>

            <BasicModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                size="full"
                noPadding={true}
            >
                <img
                    src={src}
                    alt={alt}
                    style={{
                        display: "block",
                        margin: "auto",
                        width: "auto",
                        height: "auto",
                        maxWidth: "90vw",
                        maxHeight: "82vh",
                        objectFit: "contain",
                        borderRadius: "12px",
                    }}
                />
            </BasicModal>
        </>
    );
};

export default Document;