// ============================================================
// src/utils/uploadToStorage.js — загрузка в Firebase Storage (задача 4).
//
// ЧТО ДОБАВЛЕНО (диагностика зависания на 0%):
//   Подробное логирование каждого этапа в console с префиксом [upload]:
//   старт (имя/размер/тип), прогресс, ошибка (с error.code), завершение
//   (ссылка). Теперь если загрузка не стартует — в консоли будет виден
//   код ошибки (storage/unauthorized, storage/bucket-not-found,
//   storage/network и т.д.), по которому сразу понятна причина.
// Логика загрузки — без изменений.
// ============================================================

import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export function uploadFile(file, pathPrefix, onProgress) {
    return new Promise((resolve, reject) => {
        if (!storage) {
            const err = new Error("Firebase Storage не инициализирован (firebase.js)");
            err.code = "storage/not-initialized";
            console.error("[upload] FAIL:", err.code, err.message);
            reject(err);
            return;
        }

        console.log(
            "[upload] START →",
            pathPrefix,
            "| name:", file?.name,
            "| size:", file?.size,
            "| type:", file?.type
        );

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
                    console.log("[upload] progress", percent + "%");
                    onProgress(percent);
                }
            },
            (error) => {
                // КЛЮЧЕВОЕ: выводим код ошибки — по нему таблица причин ниже.
                console.error(
                    "[upload] ERROR →",
                    error?.code,
                    "|",
                    error?.message,
                    error
                );
                reject(error);
            },
            async () => {
                try {
                    const url = await getDownloadURL(task.snapshot.ref);
                    console.log("[upload] DONE →", url);
                    resolve(url);
                } catch (error) {
                    console.error("[upload] getDownloadURL ERROR →", error?.code, error);
                    reject(error);
                }
            }
        );
    });
}