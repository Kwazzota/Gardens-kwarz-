// ============================================================
// src/firebase.js
// Подключение к Firebase + офлайн-кэш Firestore + Storage (задача 4).
//
// ЧТО ДОБАВЛЕНО ПО СРАВНЕНИЮ С ПРОШЛОЙ ВЕРСИЕЙ:
//   getStorage(app) — файловое хранилище для PDF и картинок.
//   Теперь большие файлы (PDF, превью) НЕ кладутся в Firestore
//   base64-ом (там лимит 1 МБ на документ), а уходят в Storage;
//   в Firestore пишется только ссылка. Экспортируем storage наружу
//   для утилиты uploadToStorage.js.
//   Обёрнуто в try/catch: если Storage по какой-то причине не
//   поднялся — сайт (db) продолжит работать, просто загрузка файлов
//   в админке даст понятную ошибку.
// Офлайн-кэш Firestore — без изменений.
// ============================================================

import { initializeApp } from "firebase/app";
import {
    getFirestore,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAGTJxcKSO1fTqgMXwCUXy58QUJMK8qBLU",
    authDomain: "snt-kwarz-admin.firebaseapp.com",
    projectId: "snt-kwarz-admin",
    storageBucket: "snt-kwarz-admin.firebasestorage.app",
    messagingSenderId: "882309437065",
    appId: "1:882309437065:web:9dc07bb710e1d078919858",
};

const app = initializeApp(firebaseConfig);

// Firestore с офлайн-кэшем (как было)
let db;
try {
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
        }),
    });
    console.log("✅ Firestore запущен с офлайн-кэшем");
} catch (error) {
    console.warn("Не удалось включить офлайн-кэш, используем обычный режим:", error);
    db = getFirestore(app);
}

// Storage для файлов (задача 4)
let storage = null;
try {
    storage = getStorage(app);
    console.log("✅ Firebase Storage подключён");
} catch (error) {
    console.warn("Не удалось подключить Firebase Storage:", error);
}

export { db, storage };