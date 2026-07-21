"use client";
import * as React from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

export function HoverExpand({ items, collapsedHeight = 68, expandedHeight = 320, className }) {
    const [hoveredIndex, setHoveredIndex] = React.useState(null);

    // Функция для переключения состояния по клику (для мобильных)
    const toggleHover = (index) => {
        setHoveredIndex(hoveredIndex === index ? null : index);
    };

    return (
        <div className={cn("flex flex-col w-full", className)}>
            <div className="w-full border-t border-current opacity-15" />
            {items.map((item, i) => {
                const isHovered = hoveredIndex === i;
                const isOtherHovered = hoveredIndex !== null && !isHovered;

                return (
                    <React.Fragment key={i}>
                        <motion.div
                            className="relative w-full overflow-hidden cursor-pointer"
                            animate={{
                                height: isHovered ? expandedHeight : collapsedHeight,
                                opacity: isOtherHovered ? 0.38 : 1,
                                backgroundColor: isHovered ? "rgba(120, 113, 108, 0.08)" : "transparent",
                            }}
                            transition={{
                                height: { type: "spring", stiffness: 280, damping: 32, mass: 0.9 },
                                backgroundColor: { duration: 0.3, ease: "easeOut" },
                                opacity: { duration: 0.22, ease: "easeOut" },
                            }}
                            onHoverStart={() => setHoveredIndex(i)}
                            onHoverEnd={() => setHoveredIndex(null)}
                            onClick={() => toggleHover(i)} // <-- Добавлен клик для мобильных!
                            style={{
                                boxShadow: isHovered ? "0 8px 30px rgba(0, 0, 0, 0.08)" : "0 0 0 rgba(0, 0, 0, 0)",
                            }}
                        >
                            <motion.div className="absolute inset-0 px-5 py-4 flex flex-col justify-center" initial={false}>
                                <div className="flex items-baseline gap-3 mb-2">
                                    <motion.span
                                        className="text-xs tabular-nums shrink-0 opacity-40 font-medium"
                                        animate={{ opacity: isHovered ? 0.6 : 0.4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {String(i + 1).padStart(2, "0")}
                                    </motion.span>

                                    <motion.h3
                                        className="font-semibold tracking-tight truncate flex-1"
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
                                        transition={{ duration: 0.3, delay: isHovered ? 0.1 : 0, ease: [0.23, 1, 0.32, 1] }}
                                    >
                                        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">
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
                            </motion.div>
                        </motion.div>
                        <div className="w-full border-t border-current opacity-15" />
                    </React.Fragment>
                );
            })}
        </div>
    );
}