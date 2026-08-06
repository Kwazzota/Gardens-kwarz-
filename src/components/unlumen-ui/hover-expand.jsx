"use client";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import React from "react";

// ============================================================
// HoverExpand — список с раскрытием по наведению (ПК) и тапу (моб.).
//
// ЧТО ИЗМЕНИЛОСЬ ПО СРАВНЕНИЮ СО СТАРОЙ ВЕРСИЕЙ:
//   1) expandedHeight БОЛЬШЕ НЕ фиксированное 560. Теперь высота
//      раскрытой карточки = РЕАЛЬНАЯ высота её контента (измеряем
//      через ref + ResizeObserver). Короткий текст → низкая карточка,
//      длинный → высокая, без пустого места снизу и без обрезки.
//      ResizeObserver сам перемеряет при ресайзе/повороте экрана
//      (текст переносится иначе → высота меняется).
//   2) Убран класс "truncate" с заголовка → заголовок переносится
//      на новую строку вместо "..." в одну строку.
//   3) Убран "line-clamp-3" с описания → текст показывается целиком.
//   4) Добавлен измерительный <div ref> ВНУТРИ absolute-блока. Он
//      прозрачный и схлопывается по контенту, поэтому НЕ меняет
//      геометрию и внешний вид (свёрнутый вид остаётся как был).
//
// FALLBACK (запасной путь):
//   Если по какой-то причине измерение не дало значение (очень старый
//   браузер без ResizeObserver и т.п.) — высота берётся по формуле
//   от длины текста (fallbackHeight), чтобы карточка не обрезалась.
//
// Механика hover/тапа, spring-анимация, opacity соседей — НЕ тронуты.
// ============================================================

// Вертикальный padding absolute-блока (py-4 = 16px сверху + 16px снизу)
// плюс небольшой запас, чтобы низ текста не прилипал/не обрезался.
const VERTICAL_PAD = 44;

// Запасной расчёт высоты по длине текста (только если измерение не сработало).
const fallbackHeight = (item) => {
    const len =
        (item?.label || "").length +
        (item?.description || "").length +
        (item?.content || "").length;
    return Math.max(220, Math.min(900, 180 + len * 1.1));
};

export function HoverExpand({ items, collapsedHeight = 68, className }) {
    const [hoveredIndex, setHoveredIndex] = React.useState(null);

    // Массив ссылок на измерительные обёртки каждой карточки.
    const contentRefs = React.useRef([]);
    // Измеренная высота контента каждой карточки: { [index]: height }.
    const [heights, setHeights] = React.useState({});

    // Переключение по клику (для мобильных).
    const toggleHover = (index) => {
        setHoveredIndex(hoveredIndex === index ? null : index);
    };

    // Пересчёт высот. setState пропускается, если ничего не изменилось,
    // чтобы не вызывать лишних ререндеров (и не дёргать ResizeObserver).
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

    // Измеряем при маунте/смене данных и подписываемся на изменение
    // размера каждой обёртки (ресайз окна, поворот телефона, перенос строк).
    React.useEffect(() => {
        measure();
        if (typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver(() => measure());
        contentRefs.current.forEach((el) => el && ro.observe(el));
        return () => ro.disconnect();
    }, [items, measure]);

    return (
        <div className={cn("flex flex-col w-full", className)}>
            <div className="w-full border-t border-current opacity-15" />
            {items.map((item, i) => {
                const isHovered = hoveredIndex === i;
                const isOtherHovered = hoveredIndex !== null && !isHovered;

                // Высота раскрытой карточки: измеренная + padding,
                // иначе fallback по длине текста.
                const expanded =
                    heights[i] != null ? heights[i] + VERTICAL_PAD : fallbackHeight(item);

                return (
                    <React.Fragment key={i}>
                        <motion.div
                            className="relative w-full overflow-hidden cursor-pointer"
                            animate={{
                                height: isHovered ? expanded : collapsedHeight,
                                opacity: isOtherHovered ? 0.38 : 1,
                                backgroundColor: isHovered
                                    ? "rgba(120, 113, 108, 0.08)"
                                    : "transparent",
                            }}
                            transition={{
                                height: { type: "spring", stiffness: 280, damping: 32, mass: 0.9 },
                                backgroundColor: { duration: 0.3, ease: "easeOut" },
                                opacity: { duration: 0.22, ease: "easeOut" },
                            }}
                            onHoverStart={() => setHoveredIndex(i)}
                            onHoverEnd={() => setHoveredIndex(null)}
                            onClick={() => toggleHover(i)}
                            style={{
                                boxShadow: isHovered
                                    ? "0 8px 30px rgba(0, 0, 0, 0.08)"
                                    : "0 0 0 rgba(0, 0, 0, 0)",
                            }}
                        >
                            <motion.div
                                className="absolute inset-0 px-5 py-4 flex flex-col justify-center"
                                initial={false}
                            >
                                {/* ИЗМЕРИТЕЛЬНАЯ ОБЁРТКА: прозрачный div, схлопывается
                                    по контенту → offsetHeight = реальная высота текста.
                                    Геометрию/вид НЕ меняет (высота = сумме детей, как было). */}
                                <div ref={(el) => (contentRefs.current[i] = el)}>
                                    <div className="flex items-baseline gap-3 mb-2">
                                        {/* truncate УБРАН → заголовок переносится на новую строку */}
                                        <motion.h3
                                            className="font-semibold tracking-tight flex-1 whitespace-normal break-words"
                                            style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)" }}
                                            animate={{ opacity: isHovered ? 1 : 0.9 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {item.label}
                                        </motion.h3>

                                        {item.sublabel && (
                                            <motion.span
                                                className="text-xs tracking-widest uppercase shrink-0 ml-auto"
                                                animate={{ opacity: isHovered ? 0.6 : 0.45 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {item.sublabel}
                                            </motion.span>
                                        )}
                                    </div>

                                    {item.description && (
                                        <motion.div
                                            className="mt-3"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{
                                                opacity: isHovered ? 1 : 0,
                                                y: isHovered ? 0 : 10,
                                            }}
                                            transition={{
                                                duration: 0.3,
                                                delay: isHovered ? 0.1 : 0,
                                                ease: [0.23, 1, 0.32, 1],
                                            }}
                                        >
                                            {/* line-clamp-3 УБРАН → текст целиком */}
                                            <p className="text-sm text-foreground/70 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </motion.div>
                                    )}

                                    {item.content && (
                                        <motion.div
                                            className="mt-4 pt-4 border-t border-current opacity-15"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: isHovered ? 1 : 0 }}
                                            transition={{ duration: 0.3, delay: isHovered ? 0.15 : 0 }}
                                        >
                                            <div className="text-sm text-foreground/60">{item.content}</div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                        <div className="w-full border-t border-current opacity-15" />
                    </React.Fragment>
                );
            })}
        </div>
    );
}