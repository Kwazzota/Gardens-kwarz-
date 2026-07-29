const Hero = () => {
    return (
        <div className="hero">
            <div className="hero__body">
                <img src={`${import.meta.env.BASE_URL}banner.jpg`} alt="Баннер" />
            </div>
        </div>
    )
}

export default Hero