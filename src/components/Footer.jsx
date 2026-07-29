// ============================================================
// Footer.jsx — подвал: контакты + схема сада.
//
// ЧТО ДОБАВЛЕНО (фикс «клик по почте ничего не делает»):
//   mailto: открывает СИСТЕМНЫЙ почтовый клиент, а не вкладку. Если на
//   компьютере клиент не настроен — клик выглядит как «ничего не происходит»
//   (это не баг ссылки). Поэтому на клик по email теперь ДОПОЛНИТЕЛЬНО
//   копируем адрес в буфер обмена и показываем тост снизу («Email скопирован»).
//   mailto при этом НЕ блокируем (href остаётся) → если клиент есть, он
//   откроется; если нет — пользователь всё равно получит адрес в буфере.
//   Тост = ещё и диагностика: появился при клике → клик доходит, проблема
//   была в клиенте; не появился → клик перехватывается, смотрим CSS.
// Адрес-карта и колонка схемы — без изменений.
// ============================================================

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import BasicModal from "./ui/smoothui/basic-modal";

const MAPS_URL =
    "https://yandex.ru/maps/geo/kollektivny_sad_kvarts/1659488301/?ll=60.370736%2C56.828530&z=17";
const EMAIL = "kvarcsnt@gmail.com";

const SCHEME_FILE = `${import.meta.env.BASE_URL}scheme.jpg`;
const SCHEME_IS_IMAGE = /\.(png|jpe?g|gif|webp|svg)$/i.test(SCHEME_FILE);

const Footer = () => {
    const [schemeOpen, setSchemeOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    // Чистим таймер тоста при размонтировании.
    useEffect(() => () => window.clearTimeout(toastTimer.current), []);

    const handleSchemeClick = (e) => {
        if (SCHEME_IS_IMAGE) {
            e.preventDefault();
            setSchemeOpen(true);
        }
    };

    // Копирование email в буфер (с fallback для старых браузеров / http).
    const copyEmail = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(EMAIL);
            } else {
                const ta = document.createElement("textarea");
                ta.value = EMAIL;
                ta.style.position = "fixed";
                ta.style.opacity = "0";
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
            }
            return true;
        } catch {
            return false;
        }
    };

    // Клик по email: копируем + тост. mailto НЕ блокируем (href работает сам).
    const handleEmailClick = async () => {
        const ok = await copyEmail();
        setToast(ok ? `Email скопирован: ${EMAIL}` : "Не удалось скопировать адрес");
        window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(null), 2500);
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
                        <svg className="footer__link-icon" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                             strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="footer__link-text">
                            коллективный сад Кварц, Екатеринбург, Свердловская область
                        </span>
                    </a>

                    {/* Email → mailto + копирование в буфер + тост */}
                    <a
                        className="footer__link footer__link--email"
                        href={`mailto:${EMAIL}`}
                        onClick={handleEmailClick}
                        aria-label={`Написать на почту ${EMAIL} (адрес также копируется в буфер обмена)`}
                    >
                        <svg className="footer__link-icon" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                             strokeLinejoin="round" aria-hidden="true">
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <span className="footer__link-text">{EMAIL}</span>
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
                        <svg className="footer__scheme-btn-icon" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                             strokeLinejoin="round" aria-hidden="true">
                            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
                            <line x1="9" y1="3" x2="9" y2="18" />
                            <line x1="15" y1="6" x2="15" y2="21" />
                        </svg>
                        <span className="footer__scheme-btn-label">Открыть схему сада</span>
                        <svg className="footer__scheme-btn-arrow" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                             strokeLinejoin="round" aria-hidden="true">
                            {SCHEME_IS_IMAGE ? (
                                <>
                                    <circle cx="11" cy="11" r="7" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    <line x1="11" y1="8" x2="11" y2="14" />
                                    <line x1="8" y1="11" x2="14" y2="11" />
                                </>
                            ) : (
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

            {SCHEME_IS_IMAGE && (
                <BasicModal isOpen={schemeOpen} onClose={() => setSchemeOpen(false)} size="full" noPadding={true}>
                    <img src={SCHEME_FILE} alt="Схема сада «Кварц»" className="block max-w-full max-h-[80vh]" />
                </BasicModal>
            )}

            {/* Тост-подсказка (копирование email и т.п.) */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 20, x: "-50%" }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: "fixed",
                            left: "50%",
                            bottom: "24px",
                            background: "rgba(40, 40, 40, 0.92)",
                            color: "#fff",
                            padding: "10px 18px",
                            borderRadius: "999px",
                            fontSize: "14px",
                            zIndex: 200,
                            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.25)",
                            pointerEvents: "none",
                        }}
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Footer;