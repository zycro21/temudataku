import { useState } from "react";
import "../assets/styles/toolsCarousel.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const tools = [
    { name: "Python", src: require("../assets/images/python.png") },
    { name: "R", src: require("../assets/images/r.png") },
    { name: "Numpy", src: require("../assets/images/numpy.png") },
    { name: "Pandas", src: require("../assets/images/pandas.png") },
    { name: "Scikit-Learn", src: require("../assets/images/scikit-learn.png") },
    { name: "Seaborn", src: require("../assets/images/seaborn-2.png") },
    { name: "Tensorflow", src: require("../assets/images/tensorflow.png") },
    { name: "Tableau", src: require("../assets/images/tableau.png") }
];

const ToolCarousel = () => {
    const [index, setIndex] = useState(0);
    const visibleItems = 3;
    const totalItems = tools.length;
    const maxIndex = totalItems - visibleItems;

    const prevSlide = () => {
        setIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    const nextSlide = () => {
        setIndex((prevIndex) => Math.min(prevIndex + 1, maxIndex));
    };

    return (
        <div className="custom-carousel">
            <button onClick={prevSlide} className="carousel-btn left-btn">
                <FaChevronLeft />
            </button>

            <div className="carousel-container">
                <div
                    className="carousel-track"
                    style={{ transform: `translateX(-${index * 33.33}%)` }}
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
