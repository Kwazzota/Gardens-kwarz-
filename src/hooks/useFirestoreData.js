// ============================================================
// src/hooks/useFirestoreData.js
// Хук для чтения/записи данных в облачную базу Firestore.
//
// ПРИНЦИП РАБОТЫ:
//   1. При загрузке → читаем документ из Firestore.
//   2. Если документа нет → создаём с дефолтными данными.
//   3. При изменении → записываем обратно в Firestore (с задержкой 500мс).
//   4. Данные хранятся в облаке → видны с ЛЮБОГО устройства.
//
// СТРУКТУРА В FIRESTORE:
//   Коллекция: "siteData"
//     ├── Документ: "announcements" → { items: [...] }
//     └── Документ: "documents"     → { items: [...] }
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * @param {string} docId        — ID документа ("announcements" или "documents")
 * @param {Array}  defaultValue — дефолтные данные (если в облаке ещё пусто)
 * @returns {{ data: Array, setData: Function, loading: boolean }}
 */
export function useFirestoreData(docId, defaultValue) {
    const [data, setDataState] = useState(defaultValue);
    const [loading, setLoading] = useState(true);

    // Флаг: пропускаем первую запись (данные только что прочитаны из облака)
    const skipNextWrite = useRef(false);

    // ============================================================
    // ЧТЕНИЕ из Firestore при загрузке
    // ============================================================
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Путь к документу: siteData / {docId}
                const docRef = doc(db, "siteData", docId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // Документ найден → берём данные из облака
                    const cloudData = docSnap.data().items;
                    skipNextWrite.current = true; // Не записывать обратно
                    setDataState(cloudData);
                } else {
                    // Документа нет → создаём с дефолтными данными
                    await setDoc(docRef, { items: defaultValue });
                    setDataState(defaultValue);
                }
            } catch (error) {
                console.error(`Ошибка Firestore (${docId}):`, error);
                // Если облако недоступно — используем дефолт
                setDataState(defaultValue);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [docId]);

    // ============================================================
    // ЗАПИСЬ в Firestore при изменении данных
    // ============================================================
    useEffect(() => {
        // Пропускаем первую запись (данные только что из облака)
        if (skipNextWrite.current) {
            skipNextWrite.current = false;
            return;
        }

        const saveToCloud = async () => {
            try {
                const docRef = doc(db, "siteData", docId);
                await setDoc(docRef, { items: data });
                console.log(`✅ Данные "${docId}" сохранены в облако`);
            } catch (error) {
                console.error(`❌ Ошибка записи "${docId}":`, error);
            }
        };

        // Debounce 500мс: не пишем при каждом нажатии клавиши,
        // а ждём паузу после последнего изменения.
        const timer = setTimeout(saveToCloud, 500);
        return () => clearTimeout(timer);
    }, [data, docId]);

    // ============================================================
    // Публичный setData (поддерживает и значение, и функцию)
    // ============================================================
    const setData = useCallback((newData) => {
        setDataState((prev) =>
            typeof newData === "function" ? newData(prev) : newData
        );
    }, []);

    return { data, setData, loading };
}