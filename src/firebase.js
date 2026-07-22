// ============================================================
// src/firebase.js
// Файл подключения к облачной базе Firebase.
//
// ЧТО ЗДЕСЬ ПРОИСХОДИТ:
//   1. initializeApp(firebaseConfig) — создаёт связь с проектом
//      snt-kwarz-admin на серверах Google.
//   2. getFirestore(app) — берёт из этого приложения
//      экземпляр базы данных Firestore.
//   3. export const db — ЭКСПОРТИРУЕТ базу наружу, чтобы другие
//      файлы (в частности useFirestoreData.js) могли её импортировать
//      через:  import { db } from "../firebase";
//
// ВАЖНО:
//   Без строки `export const db = ...` другие файлы НЕ СМОГУТ
//   получить доступ к базе — именно это и вызывало ошибку
//   "does not provide an export named 'db'".
// ============================================================

// Импортируем функцию создания приложения Firebase
import { initializeApp } from "firebase/app";

// Импортируем функцию получения базы данных Firestore.
// Без этого импорта переменную db создать невозможно.
import { getFirestore } from "firebase/firestore";

// Ваша конфигурация проекта (из консоли Firebase).
// Менять НЕ нужно — это ваши реальные ключи.
const firebaseConfig = {
    apiKey: "AIzaSyAGTJxcKSO1fTqgMXwCUXy58QUJMK8qBLU",
    authDomain: "snt-kwarz-admin.firebaseapp.com",
    projectId: "snt-kwarz-admin",
    storageBucket: "snt-kwarz-admin.firebasestorage.app",
    messagingSenderId: "882309437065",
    appId: "1:882309437065:web:9dc07bb710e1d078919858",
};

// Создаём Firebase-приложение (контейнер с конфигом)
const app = initializeApp(firebaseConfig);

// Создаём экземпляр базы данных Firestore и ЭКСПОРТИРУЕМ его.
// Ключевое слово `export` — именно оно решает вашу ошибку.
export const db = getFirestore(app);