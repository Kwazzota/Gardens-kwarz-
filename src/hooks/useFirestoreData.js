// ============================================================
// src/hooks/useFirestoreData.js
// Хук синхронизации с Firestore В РЕАЛЬНОМ ВРЕМЕНИ + защита
// от потери правок при перезагрузке.
//
// ЧТО ЗДЕСЬ ПРОИСХОДИТ (по порядку):
//   1. onSnapshot — ПОДПИСКА на документ в облаке. Срабатывает:
//        - сразу при загрузке (отдаёт кэш, а потом свежие данные);
//        - при ЛЮБОМ изменении с любого устройства.
//   2. При изменении данных пользователем — записываем в облако
//      с небольшой задержкой (debounce), чтобы не писать на
//      каждую нажатую клавишу.
//   3. ЗАЩИТА ОТ ЗАЦИКЛИВАНИЯ: данные, пришедшие из облака,
//      запоминаем в lastCloudRef. Перед записью сравниваем —
//      если текущие данные совпадают с облаком, НЕ пишем.
//   4. ЗАЩИТА ОТ ПОТЕРИ ПРИ ПЕРЕЗАГРУЗКЕ (flush):
//        - держим актуальные данные в dataRef;
//        - при размонтировании компонента И при закрытии вкладки
//          (beforeunload) — если есть «грязная» правка, которая
//          ещё не ушла (debounce не досчитал), немедленно пишем
//          её в кэш/облако. С офлайн-кэшем это быстро и надёжно.
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

/**
 * @param {string} docId        — ID документа ("announcements" или "documents")
 * @param {Array}  defaultValue — дефолтные данные (если в облаке и кэше пусто)
 * @returns {{ data: Array, setData: Function, loading: boolean }}
 */
export function useFirestoreData(docId, defaultValue) {
    const [data, setDataState] = useState(defaultValue);
    const [loading, setLoading] = useState(true);

    // JSON последних данных, полученных ИЗ ОБЛАКА/КЭША.
    // Нужен, чтобы отличать «пришло снаружи» от «изменил пользователь».
    const lastCloudRef = useRef(null);

    // Актуальные данные в виде ref — чтобы flush при закрытии вкладки
    // видел САМОЕ СВЕЖЕЕ состояние (замыкание useEffect так не умеет).
    const dataRef = useRef(defaultValue);
    dataRef.current = data;

    // Флаг «есть несохранённая правка» — ставим при записи,
    // снимаем, когда данные совпали с облаком.
    const dirtyRef = useRef(false);

    // ============================================================
    // Вспомогательная функция записи (используется и debounce, и flush)
    // ============================================================
    const writeNow = useCallback(async () => {
        try {
            const currentJson = JSON.stringify(dataRef.current);

            // Если совпадает с облаком — писать нечего
            if (currentJson === lastCloudRef.current) {
                dirtyRef.current = false;
                return;
            }

            const docRef = doc(db, "siteData", docId);
            // С офлайн-кэшем setDoc резолвится сразу после записи в кэш,
            // а отправка в облако идёт в фоне → правка не теряется.
            await setDoc(docRef, { items: dataRef.current });

            lastCloudRef.current = currentJson;
            dirtyRef.current = false;
            console.log(`✅ Данные "${docId}" сохранены`);
        } catch (error) {
            // Сюда попадём, например, при превышении 1 МБ на документ
            // (слишком большие картинки в base64).
            console.error(`❌ Ошибка записи "${docId}":`, error);
        }
    }, [docId]);

    // ============================================================
    // ПОДПИСКА в реальном времени (onSnapshot)
    // ============================================================
    useEffect(() => {
        const docRef = doc(db, "siteData", docId);

        const unsubscribe = onSnapshot(
            docRef,
            async (docSnap) => {
                if (docSnap.exists()) {
                    const cloudData = docSnap.data().items;
                    lastCloudRef.current = JSON.stringify(cloudData);
                    // Если пользователь прямо сейчас НЕ редактирует
                    // (нет «грязной» правки) — принимаем данные из облака.
                    // Это защищает от того, чтобы облако «затёрло»
                    // локальную правку в момент её ввода.
                    if (!dirtyRef.current) {
                        setDataState(cloudData);
                    }
                } else {
                    // Документа нет (самый первый запуск) — создаём
                    await setDoc(docRef, { items: defaultValue });
                    lastCloudRef.current = JSON.stringify(defaultValue);
                    setDataState(defaultValue);
                }
                setLoading(false);
            },
            (error) => {
                // Честная обработка ошибки подписки.
                // С офлайн-кэшем сюда попадаем редко (только если совсем
                // нет ни кэша, ни сети). Логируем явно.
                console.error(`⚠️ Ошибка подписки Firestore (${docId}):`, error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [docId]);

    // ============================================================
    // ЗАПИСЬ с задержкой (debounce) при изменении данных
    // ============================================================
    useEffect(() => {
        if (loading) return; // пока первая загрузка — не пишем

        const currentJson = JSON.stringify(data);
        if (currentJson === lastCloudRef.current) {
            dirtyRef.current = false; // совпало с облаком — чисто
            return;
        }

        // Данные отличаются от облака → есть правка
        dirtyRef.current = true;

        const timer = setTimeout(() => {
            writeNow();
        }, 400); // ждём паузу 400 мс после последнего изменения

        return () => clearTimeout(timer);
    }, [data, docId, loading, writeNow]);

    // ============================================================
    // FLUSH: сохраняем «грязную» правку при закрытии/перезагрузке
    // ============================================================
    useEffect(() => {
        // beforeunload = пользователь закрывает вкладку / жмёт F5
        const handleBeforeUnload = () => {
            if (dirtyRef.current) {
                // fire-and-forget: с офлайн-кэшем запись в IndexedDB
                // успеет пройти даже без await
                writeNow();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        // cleanup сработает при размонтировании компонента
        // (например, переход на другую страницу) — тоже сохраняем
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            if (dirtyRef.current) {
                writeNow();
            }
        };
    }, [writeNow]);

    // ============================================================
    // Публичный setData (значение или функция-обновитель)
    // ============================================================
    const setData = useCallback((newData) => {
        setDataState((prev) =>
            typeof newData === "function" ? newData(prev) : newData
        );
    }, []);

    return { data, setData, loading };
}