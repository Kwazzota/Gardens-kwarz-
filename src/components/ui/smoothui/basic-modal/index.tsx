"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useOnClickOutside } from "usehooks-ts";

export interface BasicModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void; // Исправил тип с boolean на void, так правильнее
  size?: "sm" | "md" | "lg" | "xl" | "full";
  title?: string;
  noPadding?: boolean; // <-- Новый проп
}

const modalSizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl", // Можно изменить на "max-w-7xl" или "max-w-[95vw]", если нужно ещё шире
};

export default function BasicModal({
                                     isOpen,
                                     onClose,
                                     title,
                                     children,
                                     size = "md",
                                     noPadding = false, // <-- Значение по умолчанию
                                   }: BasicModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useOnClickOutside(modalRef, () => onClose());
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const titleId = title
      ? `modal-title-${Math.random().toString(36).substring(2, 9)}`
      : undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else if (previousActiveElementRef.current) {
      previousActiveElementRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = Array.from(
            modalRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
        );
        const firstElement = focusableElements[0];
        // @ts-ignore
        const lastElement = focusableElements.at(-1);

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const modalContent = (
      <AnimatePresence>
        {isOpen && (
            <>
              <motion.div
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 z-80 bg-background/70 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  onClick={(e) => {
                    if (e.target === overlayRef.current) {
                      onClose();
                    }
                  }}
                  ref={overlayRef}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              />

              <motion.div
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 z-90 flex items-center justify-center overflow-y-auto px-4 py-6 sm:p-0"
                  exit={{ opacity: 0 }}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              >
                <motion.div
                    animate={shouldReduceMotion ? {} : { scale: 1, y: 0, opacity: 1 }}
                    aria-labelledby={titleId}
                    aria-modal="true"
                    // <-- Здесь добавлена логика noPadding
                    className={`${modalSizes[size]} relative mx-auto w-full rounded-xl border bg-primary shadow-xl ${
                        noPadding ? "p-0 overflow-hidden" : "p-4 sm:p-6"
                    }`}
                    exit={
                      shouldReduceMotion
                          ? { opacity: 0, transition: { duration: 0 } }
                          : { scale: 0.95, y: 10, opacity: 0, transition: { duration: 0.15 } }
                    }
                    initial={
                      shouldReduceMotion
                          ? { opacity: 1 }
                          : { scale: 0.95, y: 10, opacity: 0 }
                    }
                    ref={modalRef}
                    role="dialog"
                    transition={
                      shouldReduceMotion
                          ? { duration: 0 }
                          : { type: "spring" as const, damping: 25, stiffness: 300, duration: 0.25 }
                    }
                >
                  {/* Header */}
                  {/* <-- Если noPadding, кнопка закрытия плавает поверх контента */}
                  <div className={`flex items-center justify-between ${noPadding ? "absolute top-3 right-3 z-20" : "mb-4"}`}>
                    {title && !noPadding && (
                        <h3 className="font-medium text-xl leading-6" id={titleId}>
                          {title}
                        </h3>
                    )}
                    <motion.button
                        aria-label="Close modal"
                        className={`min-h-[44px] min-w-[44px] rounded-full p-2 transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            noPadding ? "bg-background/80 backdrop-blur-sm" : ""
                        }`}
                        onClick={onClose}
                        ref={closeButtonRef}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                        type="button"
                        whileHover={shouldReduceMotion ? {} : { rotate: 90 }}
                    >
                      <X aria-hidden="true" className="h-5 w-5" />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className={noPadding ? "w-full h-full flex items-center justify-center" : "relative"}>
                    {children}
                  </div>
                </motion.div>
              </motion.div>
            </>
        )}
      </AnimatePresence>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(modalContent, document.body);
}