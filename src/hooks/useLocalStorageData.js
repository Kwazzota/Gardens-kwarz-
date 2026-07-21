// ============================================================
// useLocalStorageData.js
// Кастомный хук для работы с данными через localStorage.
//
// Зачем это нужно:
//   - Данные объявлений/документов хранятся в браузере (localStorage).
//   - При первом запуске (localStorage пуст) подставляются дефолтные данные.
//   - Любое изменение в админке сразу записывается в localStorage.
//   - Главная страница при загрузке читает АКТУАЛЬНЫЕ данные из localStorage.
//   - Не нужен бэкенд — всё работает локально.
//
// Использование:
//   const { data, setData } = useLocalStorageData('myKey', defaultArray);
// ============================================================

import { useState, useEffect, useCallback } from "react";

/**
 * @param {string} storageKey  — ключ в localStorage (уникальный для каждого набора данных)
 * @param {Array}  defaultValue — дефолтный массив (используется если в localStorage пусто)
 * @returns {{ data: Array, setData: Function }}
 */
export function useLocalStorageData(storageKey, defaultValue) {
    // --- Инициализация состояния ---
    // Читаем из localStorage один раз при монтировании.
    // Если данных нет — используем defaultValue.
    const [data, setDataState] = useState(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                return JSON.parse(stored); // Данные уже есть — берём их
            }
        } catch (e) {
            console.warn(`Ошибка чтения localStorage ключ "${storageKey}":`, e);
        }
        // Первый запуск или ошибка — возвращаем дефолт
        return defaultValue;
    });

    // --- Синхронизация: при каждом изменении data пишем в localStorage ---
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn(`Ошибка записи в localStorage ключ "${storageKey}":`, e);
        }
    }, [storageKey, data]);

    // --- Обёртка setData ---
    // Используем useCallback, чтобы функция не пересоздавалась при каждом рендере.
    const setData = useCallback((newData) => {
        setDataState(newData);
    }, []);

    return { data, setData };
}