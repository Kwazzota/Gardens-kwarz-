// ============================================================
// src/hooks/useFirestoreData.js
// Хук для работы с Firestore В РЕАЛЬНОМ ВРЕМЕНИ.
//
// ЧТО ИЗМЕНИЛОСЬ ПО СРАВНЕНИЮ СО СТАРОЙ ВЕРСИЕЙ:
//   Было: getDoc() — прочитали данные ОДИН раз при загрузке.
//         Изменения с других устройств были не видны без F5.
//   Стало: onSnapshot() — ПОДПИСКА. Firestore сам присылает
//         новые данные каждый раз, когда кто-то их меняет.
//         Изменение на телефоне → мгновенно видно на ПК и наоборот.
//
// КАК УСТРОЕНА ЗАЩИТА ОТ ЗАЦИКЛИВАНИЯ:
//   Когда данные приходят из облака, мы их записываем в state.
//   Это могло бы снова触发нуть запись в облако → бесконечный цикл.
//   Чтобы этого не было, мы храним lastCloudData (JSON последних
//   данных из облака) и перед записью СРАВНИВАЕМ:
//     - если текущие данные == данным из облака → НЕ пишем;
//     - если отличаются (пользователь реально изменил) → пишем.
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

/**
 * @param {string} docId        — ID документа ("announcements" или "documents")
 * @param {Array}  defaultValue — дефолтные данные (если в облаке ещё пусто)
 * @returns {{ data: Array, setData: Function, loading: boolean }}
 */
export function useFirestoreData(docId, defaultValue) {
    const [data, setDataState] = useState(defaultValue);
    const [loading, setLoading] = useState(true);

    // JSON-строка последних данных, полученных ИЗ ОБЛАКА.
    // Нужна, чтобы отличать "пришло из облака" от "изменил пользователь".
    const lastCloudData = useRef(null);

    // ============================================================
    // ПОДПИСКА в реальном времени (onSnapshot)
    // ============================================================
    useEffect(() => {
        const docRef = doc(db, "siteData", docId);

        // onSnapshot вызывается:
        //   1. СРАЗУ при подписке (присылает текущие данные).
        //   2. При КАЖДОМ изменении документа в облаке.
        // Возвращает функцию unsubscribe для отписки.
        const unsubscribe = onSnapshot(
            docRef,
            async (docSnap) => {
                if (docSnap.exists()) {
                    // Документ есть → берём актуальные данные из облака
                    const cloudData = docSnap.data().items;

                    // Запоминаем JSON этих данных, чтобы потом
                    // не записать их обратно без изменений.
                    lastCloudData.current = JSON.stringify(cloudData);

                    // Обновляем state → компонент перерисуется
                    setDataState(cloudData);
                } else {
                    // Документа ещё нет (первый запуск) → создаём с дефолтом
                    await setDoc(docRef, { items: defaultValue });
                    lastCloudData.current = JSON.stringify(defaultValue);
                    setDataState(defaultValue);
                }
                setLoading(false);
            },
            (error) => {
                // Обработчик ошибок подписки
                console.error(`Ошибка подписки Firestore (${docId}):`, error);
                setLoading(false);
            }
        );

        // При размонтировании компонента — отписываемся,
        // чтобы не утекала память и не было лишних запросов.
        return () => unsubscribe();
    }, [docId]);

    // ============================================================
    // ЗАПИСЬ в облако при изменении данных
    // ============================================================
    useEffect(() => {
        // Пока идёт первая загрузка — не пишем
        if (loading) return;

        const saveToCloud = async () => {
            try {
                const currentJson = JSON.stringify(data);

                // ЗАЩИТА ОТ ЗАЦИКЛИВАНИЯ:
                // если данные идентичны тем, что пришли из облака, —
                // значит пользователь ничего не менял, писать НЕ НУЖНО.
                if (currentJson === lastCloudData.current) {
                    return;
                }

                // Данные реально изменились → пишем в облако
                const docRef = doc(db, "siteData", docId);
                await setDoc(docRef, { items: data });

                // Обновляем "последние облачные данные", чтобы
                // эхо от нашей же записи не触发нуло повторную запись.
                lastCloudData.current = currentJson;

                console.log(`✅ Данные "${docId}" сохранены в облако`);
            } catch (error) {
                // ВАЖНО: здесь ловится ошибка "документ больше 1 МБ".
                // Если видите в консоли "1048576 bytes" — картинки слишком большие.
                console.error(`❌ Ошибка записи "${docId}":`, error);
            }
        };

        // Debounce 500 мс: не пишем при каждом нажатии клавиши,
        // а ждём паузу после последнего изменения.
        const timer = setTimeout(saveToCloud, 500);
        return () => clearTimeout(timer);
    }, [data, docId, loading]);

    // ============================================================
    // Публичный setData (поддерживает значение и функцию-обновитель)
    // ============================================================
    const setData = useCallback((newData) => {
        setDataState((prev) =>
            typeof newData === "function" ? newData(prev) : newData
        );
    }, []);

    return { data, setData, loading };
}