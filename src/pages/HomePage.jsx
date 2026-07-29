// ============================================================
// HomePage.jsx — главная страница сайта.
// Собирает Hero + Main + News + Footer.
// News идёт ПОД Main (по центру, ~60% ширины — см. News.jsx).
// ============================================================

import Hero from "../components/Hero";
import Main from "../components/Main";
import News from "../components/News";
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