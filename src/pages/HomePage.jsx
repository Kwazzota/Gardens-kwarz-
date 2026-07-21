// ============================================================
// HomePage.jsx
// Главная страница сайта. Собирает Hero + Main + Footer.
// Данные для Main теперь берутся из localStorage через хук.
// ============================================================

import Hero from "../components/Hero";
import Main from "../components/Main";
import Footer from "../components/Footer";

const HomePage = () => {
    return (
        <>
            <Hero />
            <Main />
            <Footer />
        </>
    );
};

export default HomePage;