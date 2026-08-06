// ============================================================
// News.jsx — секция НОВОСТЕЙ на главной.
//
// РАСПОЛОЖЕНИЕ:
//   Рендерится в HomePage ПОД <Main/>, по центру, шириной ~60% от
//   ширины Main. Ширина задана классами:
//     w-[60%]            — 60% от родителя на средних экранах;
//     max-w-[720px]      — ограничение на ШИРОКИХ экранах.
//                          ВАЖНО: чистые "60% от вьюпорта" на экране
//                          1920px дали бы ~1150px — это РАВНО ширине
//                          самого Main, а не 60% от него. Поэтому на
//                          широких экранах ширина "прибивается" к
//                          max-w. 720px подобрано под типичный Main
//                          ≈ 1200px (0.6 * 1200 = 720) → там получается
//                          ровно 60% от Main. Если ваш .main имеет
//                          другую max-width (см. styles/components/main.css),
//                          поставьте сюда 0.6 * (эта ширина), например
//                          для Main=1000px → max-w-[600px].
//     max-md:w-[92%]     — на телефонах (≤767px) почти во всю ширину,
//                          иначе баннеры были бы слишком узкими.
//
// ПОВЕДЕНИЕ БАННЕРА (по требованию):
//   СВЁРНУТЫЙ  — виден ТОЛЬКО заголовок (номер + label), картинки нет.
//   РАСКРЫТЫЙ  — видна ТОЛЬКО картинка (+ подпись), заголовка нет.
//   Раскрытие: наведение мыши (ПК) и тап (мобильные) — как у объявлений.
//
// КАК РАБОТАЕТ ВЫСОТА (без скачков):
//   Внутри баннера ДВА слоя:
//     1) Слой-измеритель — всегда держит в DOM картинку (width:100%,
//        height:auto). Её реальная высота измеряется через ref +
//        ResizeObserver + onLoad, поэтому раскрытый баннер раскрывается
//        ровно под высоту картинки. В свёрнутом виде слой невидим
//        (opacity:0), но МЕСТО в измерении сохраняет — поэтому высота
//        раскрытого известна заранее, ещё до наведения.
//     2) Оверлей-заголовок — absolute поверх, виден только в свёрнутом
//        виде (в раскрытом opacity:0).
//   Высоту свёрнутого баннера (collapsedHeight) делаем адаптивной:
//   72px на десктопе / 96px на мобилке (заголовок в 2 строки).
//
// HoverExpand НЕ используется и НЕ меняется — у новостей своя механика,
// чтобы не рисковать уже отлаженными объявлениями.
// ============================================================

import * as React from "react";
import { motion } from "motion/react";
import { useFirestoreData } from "../hooks/useFirestoreData";
import { defaultNews } from "../data/defaultData";

// Высота свёрнутого баннера в зависимости от ширины экрана.
const getCollapsedHeight = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches
        ? 96
        : 72;

// Вертикальный padding раскрытого баннера (py-4 = 32) + запас снизу.
const VERTICAL_PAD = 40;
// Запасная высота, пока картинка ещё не измерилась.
const FALLBACK_HEIGHT = 320;

export default function News() {
    const { data: items, loading } = useFirestoreData("news", defaultNews);

    const [hoveredIndex, setHoveredIndex] = React.useState(null);
    const [collapsedHeight, setCollapsedHeight] = React.useState(getCollapsedHeight);

    // Измерение высоты раскрытого контента (картинка + подпись).
    const contentRefs = React.useRef([]);
    const [heights, setHeights] = React.useState({});

    const measure = React.useCallback(() => {
        setHeights((prev) => {
            const next = { ...prev };
            let changed = false;
            contentRefs.current.forEach((el, i) => {
                if (el) {
                    const h = el.offsetHeight;
                    if (next[i] !== h) {
                        next[i] = h;
                        changed = true;
                    }
                }
            });
            return changed ? next : prev;
        });
    }, []);

    // Пересчёт при маунте/смене данных + подписка на ресайз каждой обёртки.
    React.useEffect(() => {
        measure();
        if (typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver(() => measure());
        contentRefs.current.forEach((el) => el && ro.observe(el));
        return () => ro.disconnect();
    }, [items, measure]);

    // Адаптивная высота свёрнутого баннера при ресайзе/повороте.
    React.useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        const onChange = () => setCollapsedHeight(getCollapsedHeight());
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    const toggle = (i) => setHoveredIndex(hoveredIndex === i ? null : i);

    if (loading) return null; // секция просто не рисуется до загрузки

    return (
        <section className="news-card">
            <div className="flex flex-col w-full">
                <div className="w-full border-t border-current opacity-15" />

                {items.map((item, i) => {
                    const isHovered = hoveredIndex === i;
                    const isOtherHovered = hoveredIndex !== null && !isHovered;

                    const measured = heights[i];
                    const expanded =
                        measured && measured > 0 ? measured + VERTICAL_PAD : FALLBACK_HEIGHT;

                    return (
                        <React.Fragment key={i}>
                            <motion.div
                                className="relative w-full overflow-hidden cursor-pointer"
                                animate={{
                                    height: isHovered ? expanded : collapsedHeight,
                                    opacity: isOtherHovered ? 0.4 : 1,
                                    backgroundColor: isHovered
                                        ? "rgba(120, 113, 108, 0.06)"
                                        : "transparent",
                                }}
                                transition={{
                                    height: { type: "spring", stiffness: 260, damping: 30, mass: 0.9 },
                                    backgroundColor: { duration: 0.3, ease: "easeOut" },
                                    opacity: { duration: 0.22, ease: "easeOut" },
                                }}
                                onHoverStart={() => setHoveredIndex(i)}
                                onHoverEnd={() => setHoveredIndex(null)}
                                onClick={() => toggle(i)}
                                style={{
                                    boxShadow: isHovered
                                        ? "0 8px 30px rgba(0, 0, 0, 0.08)"
                                        : "0 0 0 rgba(0, 0, 0, 0)",
                                }}
                            >
                                {/* СЛОЙ 1 — измеритель (раскрытый контент).
                                    Картинка всегда в DOM (width:100%, height:auto),
                                    поэтому offsetHeight стабилен. В свёрнутом виде
                                    слой невидим (opacity:0), но высоту для измерения
                                    сохраняет → раскрытие без скачков. */}
                                <div className="absolute inset-0 px-5 py-4 flex flex-col justify-start">
                                    <div
                                        ref={(el) => (contentRefs.current[i] = el)}
                                        className="transition-opacity duration-300 flex flex-col items-center"
                                        style={{ opacity: isHovered ? 1 : 0 }}
                                    >
                                        {item.image ? (
                                            <>
                                                <img
                                                    src={item.image}
                                                    alt={item.alt || item.label}
                                                    onLoad={measure}
                                                    className="block rounded-md w-auto h-auto max-w-full max-h-[70vh] object-contain"
                                                />
                                                {item.description && (
                                                    <p
                                                        className="mt-3 text-sm leading-relaxed w-full text-center"
                                                        style={{ color: "rgba(60, 60, 60, 0.8)" }}
                                                    >
                                                        {item.description}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <div
                                                className="py-8 text-center text-sm w-full"
                                                style={{ color: "#999" }}
                                            >
                                                🖼️ Изображение не загружено
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* СЛОЙ 2 — оверлей-заголовок.
                                    Видим только в свёрнутом виде (в раскрытом opacity:0).
                                    pointer-events-none — чтобы клики проходили на баннер. */}
                                <motion.div
                                    className="absolute inset-0 px-5 flex items-center pointer-events-none"
                                    animate={{ opacity: isHovered ? 0 : 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h3
                                        className="font-semibold tracking-tight whitespace-normal break-words"
                                        style={{ fontSize: "clamp(1rem, 2vw, 1.35rem)" }}
                                    >
                                        {item.label}
                                    </h3>
                                </motion.div>
                            </motion.div>

                            <div className="w-full border-t border-current opacity-15" />
                        </React.Fragment>
                    );
                })}

                {items.length === 0 && (
                    <p className="py-6 text-center text-sm" style={{ color: "#999" }}>
                        Новостей пока нет.
                    </p>
                )}
            </div>
        </section>
    );
}