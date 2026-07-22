// ============================================================
// vite.config.js
// Конфигурация сборщика Vite.
//
// ЧТО ДОБАВЛЕНО:
//   build.rollupOptions.output.manualChunks — разбивает код на части.
//   Мы выносим тяжёлые библиотеки (Firebase, React) в ОТДЕЛЬНЫЕ файлы,
//   чтобы:
//     1. Убрать предупреждение "chunks larger than 500 kB".
//     2. Браузер кэшировал их отдельно → повторные визиты быстрее.
// ============================================================

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
      react(),
      tailwindcss(),
  ],

  build: {
    rollupOptions: {
      output: {
        // manualChunks — функция, которая говорит Vite,
        // в какой файл положить каждый модуль.
        //
        // Как работает:
        //   Vite проходит по каждому подключённому файлу (id)
        //   и спрашивает: "куда его положить?".
        //   Если файл лежит в node_modules (сторонняя библиотека) —
        //   мы проверяем, какая именно, и кладём в именованный чанк.
        manualChunks(id) {
          // Обрабатываем только сторонние библиотеки из node_modules
          if (id.includes("node_modules")) {
            // Весь Firebase — в отдельный файл "firebase.js"
            // (именно он даёт основной вес ~400 КБ)
            if (id.includes("firebase") || id.includes("@firebase")) {
              return "firebase";
            }

            // React и всё, что с ним связано — в файл "react-vendor.js"
            if (
                id.includes("react") ||
                id.includes("react-dom") ||
                id.includes("react-router") ||
                id.includes("scheduler")
            ) {
              return "react-vendor";
            }

            // Все остальные библиотеки — в общий "vendor.js"
            return "vendor";
          }
          // Ваш собственный код (из src/) Vite разложит сам
        },
      },
    },
  },
});