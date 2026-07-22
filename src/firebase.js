// ============================================================
// src/firebase.js
// Подключение к Firebase + ВКЛЮЧЕНИЕ ОФЛАЙН-КЭША.
//
// ЧТО ИЗМЕНИЛОСЬ ПО СРАВНЕНИЮ СО СТАРОЙ ВЕРСИЕЙ:
//   Было:  getFirestore(app) — база работала ТОЛЬКО через сеть.
//          При плохом интернете данные не подтягивались →
//          после перезагрузки показывался дефолт («пропадало»).
//   Стало: initializeFirestore(... persistentLocalCache ...) —
//          Firebase хранит копию базы ПРЯМО В БРАУЗЕРЕ (IndexedDB).
//
// ЧТО ЭТО ДАЁТ:
//   1. При открытии сайта данные читаются МГНОВЕННО из кэша,
//      даже если интернет плохой или вообще отсутствует.
//   2. setDoc() записывает СНАЧАЛА в локальный кэш (мгновенно),
//      а в облако отправляет в фоне. Поэтому правка НЕ теряется,
//      даже если сразу после неё перезагрузить страницу или
//      если связь оборвалась.
//   3. onSnapshot сначала отдаёт кэш, потом — свежие данные из
//      облака, как только они придут.
//
// FALLBACK (запасной вариант):
//   Если по какой-то причине включить кэш не удалось (старый
//   браузер и т.п.) — в catch мы создаём обычную базу без кэша,
//   чтобы сайт не падал.
// ============================================================

import { initializeApp } from "firebase/app";
import {
    getFirestore,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
} from "firebase/firestore";

// Ваша конфигурация проекта (НЕ менять)
const firebaseConfig = {
    apiKey: "AIzaSyAGTJxcKSO1fTqgMXwCUXy58QUJMK8qBLU",
    authDomain: "snt-kwarz-admin.firebaseapp.com",
    projectId: "snt-kwarz-admin",
    storageBucket: "snt-kwarz-admin.firebasestorage.app",
    messagingSenderId: "882309437065",
    appId: "1:882309437065:web:9dc07bb710e1d078919858",
};

// Создаём Firebase-приложение
const app = initializeApp(firebaseConfig);

// Создаём базу данных С ОФЛАЙН-КЭШЕМ.
// persistentMultipleTabManager — чтобы кэш корректно работал,
// даже если сайт открыт в нескольких вкладках одновременно.
let db;
try {
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
        }),
    });
    console.log("✅ Firestore запущен с офлайн-кэшем");
} catch (error) {
    // Запасной путь: если кэш включить не удалось — обычная база.
    // Сайт продолжит работать, просто без офлайн-режима.
    console.warn("Не удалось включить офлайн-кэш, используем обычный режим:", error);
    db = getFirestore(app);
}

// Экспортируем базу наружу для хука useFirestoreData
export { db };