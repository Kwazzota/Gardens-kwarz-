// ============================================================
// Footer.jsx — подвал: контакты + схема сада (задачи 2 и 3).
//
// РАСКЛАДКА:
//   Две смысловые колонки (footer__grid = grid 1fr 1fr):
//     ЛЕВАЯ  «Контакты»  — адрес (ссылка на Яндекс.Карты) и
//                          телефон (ссылка tel:), в столбик, с иконками.
//     ПРАВАЯ «Схема сада» — заголовок + подсказка + кнопка,
//                          открывающая файл схемы из public/.
//   Между колонками — вертикальный зелёный разделитель (как было);
//   на ≤777px — одна колонка с горизонтальным разделителем.
//   Колонки появляются fade-up при прокрутке (motion whileInView).
//
// СХЕМА САДА — вариант (б): файл в public/.
//   SCHEME_FILE — путь к файлу. import.meta.env.BASE_URL нужен, чтобы
//   путь корректно собрался на GitHub Pages (подпапка + base "./").
//   SCHEME_IS_IMAGE — по расширению решаем, КАК открывать:
//     картинка (png/jpg/webp/gif/svg) → клик открывает BasicModal
//       с <img> (не уходим со страницы; единообразно с документами);
//     pdf (и прочее)                  → обычная ссылка target="_blank",
//       браузер покажет PDF во вкладке.
//   Если у вас PDF — поменяйте имя файла в SCHEME_FILE на scheme.pdf,
//   логика переключится сама (SCHEME_IS_IMAGE станет false).
//
// Адрес и телефон из задачи 2 сохранены без изменений по поведению.
// ============================================================

import { useState } from "react";
import { motion } from "motion/react";
import BasicModal from "./ui/smoothui/basic-modal";

const MAPS_URL =
    "https://yandex.ru/maps/geo/kollektivny_sad_kvarts/1659488301/?ll=60.370736%2C56.828530&z=17";
const PHONE_TEL = "tel:+79999999999";

// Путь к файлу схемы в public/. Для PDF: ".../scheme.pdf".
const SCHEME_FILE = `${import.meta.env.BASE_URL}scheme.jpg`;
const SCHEME_IS_IMAGE = /\.(png|jpe?g|gif|webp|svg)$/i.test(SCHEME_FILE);

const Footer = () => {
    const [schemeOpen, setSchemeOpen] = useState(false);

    // Клик по кнопке схемы: для картинки — модалка (preventDefault,
    // чтобы ссылка не открылась в фоне), для pdf — дефолт ссылки.
    const handleSchemeClick = (e) => {
        if (SCHEME_IS_IMAGE) {
            e.preventDefault();
            setSchemeOpen(true);
        }
    };

    return (
        <div className="footer">
            <div className="footer__grid">
                {/* ===================== КОЛОНКА 1: КОНТАКТЫ ===================== */}
                <motion.div
                    className="footer__col footer__col--contacts"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                >
                    <span className="footer__col-title">Контакты</span>

                    {/* Адрес → Яндекс.Карты */}
                    <a
                        className="footer__link footer__link--map"
                        href={MAPS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Открыть адрес СНТ «Кварц» на Яндекс.Картах"
                    >
                        <svg
                            className="footer__link-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="footer__link-text">
                            Коллективный сад Кварц, Екатеринбург, Свердловская область
                        </span>
                    </a>

                    {/* Телефон → набор номера */}
                    <a
                        className="footer__link footer__link--phone"
                        href={PHONE_TEL}
                        aria-label="Позвонить по телефону +7 999 999 99 99"
                    >
                        <svg
                            className="footer__link-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
                        </svg>
                        <span className="footer__link-text">+7 999 999 99 99</span>
                    </a>
                </motion.div>

                {/* ===================== КОЛОНКА 2: СХЕМА САДА ===================== */}
                <motion.div
                    className="footer__col footer__col--scheme"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                >
                    <span className="footer__col-title">Схема сада</span>
                    <p className="footer__col-hint">Планировка участков и проездов</p>

                    <a
                        className="footer__scheme-btn"
                        href={SCHEME_FILE}
                        target={SCHEME_IS_IMAGE ? undefined : "_blank"}
                        rel={SCHEME_IS_IMAGE ? undefined : "noopener noreferrer"}
                        onClick={handleSchemeClick}
                        aria-label="Открыть схему сада"
                    >
                        {/* Иконка карты/сетки */}
                        <svg
                            className="footer__scheme-btn-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
                            <line x1="9" y1="3" x2="9" y2="18" />
                            <line x1="15" y1="6" x2="15" y2="21" />
                        </svg>

                        <span className="footer__scheme-btn-label">
                            Открыть схему сада
                        </span>

                        {/* Стрелка — сдвигается при наведении */}
                        <svg
                            className="footer__scheme-btn-arrow"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            {SCHEME_IS_IMAGE ? (
                                // лупа с плюсом — намёк «откроется крупно»
                                <>
                                    <circle cx="11" cy="11" r="7" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    <line x1="11" y1="8" x2="11" y2="14" />
                                    <line x1="8" y1="11" x2="14" y2="11" />
                                </>
                            ) : (
                                // стрелка наружу — намёк «откроется во вкладке»
                                <>
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </>
                            )}
                        </svg>
                    </a>
                </motion.div>
            </div>

            {/* Модалка со схемой — только если схема это картинка */}
            {SCHEME_IS_IMAGE && (
                <BasicModal
                    isOpen={schemeOpen}
                    onClose={() => setSchemeOpen(false)}
                    size="full"
                    noPadding={true}
                >
                    <img
                        src={SCHEME_FILE}
                        alt="Схема сада «Кварц»"
                        className="w-full h-full object-contain"
                    />
                </BasicModal>
            )}
        </div>
    );
};

export default Footer;