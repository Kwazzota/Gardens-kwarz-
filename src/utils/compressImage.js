// ============================================================
// src/utils/compressImage.js
// Функция сжатия изображения ПЕРЕД сохранением в Firestore.
//
// ЗАЧЕМ НУЖНА:
//   Firestore хранит максимум 1 МБ в одном документе.
//   Фото с телефона часто весят 3–8 МБ, а в base64 ещё в 1.37 раза больше.
//   Без сжатия документ быстро превысит 1 МБ → запись не пройдёт →
//   картинка будет видна только тому, кто её загрузил (локально),
//   а на других устройствах её не будет.
//
// КАК РАБОТАЕТ:
//   1. Читаем выбранный файл.
//   2. Загружаем его в объект Image.
//   3. Если ширина больше maxWidth — уменьшаем с сохранением пропорций.
//   4. Рисуем уменьшенную картинку на canvas.
//   5. Экспортируем в JPEG с качеством quality (0.7 = хорошее сжатие).
//   6. Возвращаем base64-строку, которая весит в разы меньше оригинала.
//
// РЕЗУЛЬТАТ: фото 5 МБ → превращается в ~150–300 КБ.
// ============================================================

/**
 * @param {File}   file      — файл изображения, выбранный пользователем
 * @param {number} maxWidth  — максимальная ширина в пикселях (по умолчанию 1200)
 * @param {number} quality   — качество JPEG от 0 до 1 (по умолчанию 0.7)
 * @returns {Promise<string>} — base64-строка сжатого изображения
 */
export function compressImage(file, maxWidth = 1200, quality = 0.7) {
    return new Promise((resolve, reject) => {
        // Шаг 1: читаем файл как Data URL (base64)
        const reader = new FileReader();

        reader.onload = (e) => {
            // Шаг 2: создаём объект изображения и ждём его загрузки
            const img = new Image();

            img.onload = () => {
                // Шаг 3: вычисляем новые размеры, сохраняя пропорции.
                // Если картинка уже меньше maxWidth — не увеличиваем её.
                let { width, height } = img;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                // Шаг 4: создаём canvas нужного размера и рисуем картинку
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Шаг 5: экспортируем в JPEG с заданным качеством.
                // JPEG сжимает намного лучше PNG для фотографий.
                const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

                // Шаг 6: возвращаем результат
                resolve(compressedDataUrl);
            };

            img.onerror = () => reject(new Error("Не удалось загрузить изображение"));
            img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
        reader.readAsDataURL(file);
    });
}