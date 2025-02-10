import { useState } from "react";
import "../assets/styles/toolsCarousel.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const tools = [
    { name: "Python", src: require("../assets/images/python.png") },
    { name: "R", src: require("../assets/images/r.png") },
    { name: "Numpy", src: require("../assets/images/numpy.png") },
    { name: "Pandas", src: require("../assets/images/pandas.png") },
    { name: "Scikit-Learn", src: require("../assets/images/scikit-learn.png") },
    { name: "Seaborn", src: require("../assets/images/seaborn.png") },
    { name: "Tensorflow", src: require("../assets/images/tensorflow.png") },
    { name: "Tableau", src: require("../assets/images/tableau.png") }
];

const ToolCarousel = () => {
    const [index, setIndex] = useState(0);
    const visibleItems = 3;
    const totalItems = tools.length;

    const prevSlide = () => {
        setIndex((prevIndex) => Math.max(prevIndex - visibleItems, 0));
    };

    const nextSlide = () => {
        setIndex((prevIndex) =>
            Math.min(prevIndex + visibleItems, totalItems - visibleItems)
        );
    };

    return (
        <div className="custom-carousel">
            <button onClick={prevSlide} className="carousel-btn left-btn">
                <FaChevronLeft />
            </button>

            <div className="carousel-container">
                <div
                    className="carousel-track"
                    style={{ transform: `translateX(-${index * (100 / visibleItems)}%)` }}
                >
                    {tools.map((tool, i) => (
                        <div key={i} className="tool-item">
                            <img src={tool.src} alt={tool.name} />
                            <p>{tool.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={nextSlide} className="carousel-btn right-btn">
                <FaChevronRight />
            </button>
        </div>
    );
};

export default ToolCarousel;

