import { Button } from "./ui/button";
import BasicModal from "./ui/smoothui/basic-modal";
import { useState } from "react";

const Document = (props) => {
    const {
        src,
        alt = '',
        className,
        buttonLabel = 'Просмотр документа',
        downloadUrl,
        downloadLabel = 'Скачать документ',
    } = props;

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDownload = () => {
        if (downloadUrl) {
            // Создаём временную ссылку для скачивания
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = true;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <>
            <div className={`documents__buttons ${className || ''}`}>
                <Button
                    className="documents__button documents__button--view"
                    onClick={() => setIsModalOpen(true)}
                >
                    {buttonLabel}
                </Button>

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
                    className="w-full h-full object-contain"
                />
            </BasicModal>
        </>
    );
};

export default Document;