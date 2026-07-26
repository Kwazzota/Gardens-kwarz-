// ============================================================
// src/utils/uploadToStorage.js
// Утилита загрузки файла в Firebase Storage (задача 4).
//
// ЗАЧЕМ:
//   Firestore хранит максимум 1 МБ в документе → PDF/картинки туда
//   base64-ом не влезут. Storage держит файлы до гигабайтов, а в
//   Firestore мы пишем только возвращаемую отсюда ссылку (downloadURL).
//
// КАК РАБОТАЕТ uploadFile:
//   1) Кладём файл по пути "<pathPrefix>/<timestamp>_<имя>" — timestamp
//      гарантирует уникальность имени (файлы не перезатираются).
//   2) uploadBytesResumable — грузит с прогрессом (колбэк onProgress
//      отдаёт проценты 0..100, чтобы админка показала индикатор).
//   3) По завершении — getDownloadURL() даёт публичную ссылку, которую
//      и возвращаем (её потом пишем в Firestore).
//
// ПРО СИРОТ:
//   Старые файлы при замене НЕ удаляем автоматически (правило delete
//   в Storage запрещено ради безопасности — см. примечание в задаче 4).
//   Поэтому при каждой замене файла старый остаётся в Storage; чистить
//   при желании вручную через консоль Firebase → Storage.
// ============================================================

import { storage } from "../firebase";
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";

/**
 * Загрузить файл/Blob в Storage и вернуть публичную ссылку.
 * @param {File|Blob} file        — что грузим
 * @param {string}    pathPrefix  — папка в Storage, напр. "documents/files"
 * @param {Function}  [onProgress] — (percent: number) => void, 0..100
 * @returns {Promise<string>}      — downloadURL
 */
export function uploadFile(file, pathPrefix, onProgress) {
    return new Promise((resolve, reject) => {
        if (!storage) {
            reject(new Error("Firebase Storage не инициализирован (см. firebase.js)"));
            return;
        }

        // Уникальное имя: timestamp + безопасное исходное имя.
        const rawName = file.name || "file";
        const safeName = `${Date.now()}_${rawName.replace(/\s+/g, "_")}`;
        const storageRef = ref(storage, `${pathPrefix}/${safeName}`);

        const task = uploadBytesResumable(storageRef, file);

        task.on(
            "state_changed",
            (snapshot) => {
                if (onProgress && snapshot.totalBytes > 0) {
                    const percent = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    onProgress(percent);
                }
            },
            (error) => reject(error),
            async () => {
                try {
                    const url = await getDownloadURL(task.snapshot.ref);
                    resolve(url);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}