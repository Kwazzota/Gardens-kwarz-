// ============================================================
// vite.config.js
//
// ЧТО ИЗМЕНИЛОСЬ:
//   УБРАН блок build.rollupOptions.output.manualChunks.
//
// ПОЧЕМУ:
//   Ручная разбивка библиотек по чанкам (firebase / react-vendor /
//   vendor) создавала циклическую зависимость МЕЖДУ файлами сборки.
//   Из-за этого в браузере падала ошибка:
//     "Cannot access 'Ko' before initialization" (vendor-*.js)
//   и сайт показывал пустой экран.
//
//   Без manualChunks Rollup сам раскладывает код так, чтобы циклов
//   между чанками НЕ было. Да, в консоли сборки может появиться
//   предупреждение "Some chunks are larger than 500 kB" — это
//   НЕ ошибка, сайт с ним прекрасно работает и деплоится.
//   Для сайта села эта оптимизация не нужна.
//
// base: "./" — оставляем (относительные пути для GitHub Pages).
// ============================================================

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
  ],
});