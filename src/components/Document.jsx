// ============================================================
// Document.jsx — кнопки «Просмотр / Скачать» + модалка.
//
// Логика под два типа файла в downloadUrl:
//   - изображение (data:image… или путь .jpg/.png/…) → можно СМОТРЕТЬ
//     в модалке и СКАЧАТЬ;
//   - PDF / прочее (путь из public/ или внешняя ссылка) → только СКАЧАТЬ
//     (PDF картинкой не открыть, поэтому «Просмотр» для него не показываем).
//
// resolveAsset() собирает путь к файлу из public/: голое имя
// (напр. "protocol-48.pdf") дополняется префиксом BASE_URL — тем самым,
// благодаря которому на GitHub Pages уже работает схема сада. Поэтому
// и на локалке, и в онлайне файл находится без 404.
//
// Что показать в модалке (previewSrc): превью (src), а если его нет —
// сам документ-изображение (downloadUrl). Кнопка «Просмотр» видна,
// только если есть что показать картинкой.
// ============================================================

import { Button } from "./ui/button";
import BasicModal from "./ui/smoothui/basic-modal";
import { useState } from "react";

// Голое имя файла из public/ → с префиксом BASE_URL; ссылки и base64 не трогаем.
const resolveAsset = (v) => {
    if (!v) return v;
    if (/^(https?:|data:)/i.test(v)) return v;
    return `${import.meta.env.BASE_URL}${v.replace(/^\.?\/+/, "")}`;
};

// Это URL картинки? (base64-картинка или путь к изображению)
const isImageUrl = (v) =>
    !!v && (/^data:image\//i.test(v) || /\.(jpe?g|png|gif|webp)(\?|#|$)/i.test(v));

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

    const resolvedSrc = resolveAsset(src);
    const resolvedDownload = resolveAsset(downloadUrl);
    const downloadIsImage = isImageUrl(resolvedDownload);

    // Что показать в модалке: превью или сам документ-изображение.
    const previewSrc = resolvedSrc || (downloadIsImage ? resolvedDownload : null);

    const handleDownload = () => {
        if (!resolvedDownload) return;

        // Внешняя ссылка (например, старый Storage) — открыть во вкладке.
        if (/^https?:\/\//i.test(resolvedDownload)) {
            window.open(resolvedDownload, "_blank", "noopener");
            return;
        }

        // same-origin файл из public/ или base64 — принудительное скачивание.
        const link = document.createElement("a");
        link.href = resolvedDownload;
        link.download = /^data:/i.test(resolvedDownload)
            ? (alt || "document")
            : (resolvedDownload.split("/").pop() || "document");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className={`documents__buttons ${className || ""}`}>
                {/* Просмотр — только если есть что показать картинкой */}
                {previewSrc && (
                    <Button className="documents__button documents__button--view" onClick={() => setIsModalOpen(true)}>
                        {buttonLabel}
                    </Button>
                )}

                {/* Скачать — если указан любой файл */}
                {resolvedDownload && (
                    <Button className="documents__button documents__button--download" onClick={handleDownload}>
                        {downloadLabel}
                    </Button>
                )}
            </div>

            {previewSrc && (
                <BasicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="full" noPadding={true}>
                    <img src={previewSrc} alt={alt} className="block max-w-full max-h-[80vh]" />
                </BasicModal>
            )}
        </>
    );
};

export default Document;