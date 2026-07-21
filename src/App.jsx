// ============================================================
// App.jsx
// Корневой компонент с роутингом.
//
// Было:  просто <Hero/> <Main/> <Footer/> — одна страница.
// Стало: react-router-dom с двумя маршрутами:
//          "/"      → главная (Hero + Main + Footer)
//          "/admin" → админ-панель
//
// Почему BrowserRouter, а не HashRouter:
//   BrowserRouter даёт чистые URL (/admin).
//   Если деплой на GitHub Pages или статический хостинг без
//   настройки сервера — замените на HashRouter (URL будет /#/admin).
// ============================================================

import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";

const App = () => {
    return (
        <HashRouter>
            <Routes>
                {/* Главная страница */}
                <Route path="/" element={<HomePage />} />

                {/* Админ-панель */}
                <Route path="/admin" element={<AdminPage />} />
            </Routes>
        </HashRouter>
    );
};

export default App;