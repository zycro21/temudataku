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
    const totalItems = tools.length;
    const [index, setIndex] = useState(1); // Mulai dari item ke-2 agar efek animasi lebih baik

    const prevSlide = () => {
        setIndex((prevIndex) => {
            if (prevIndex === 0) {
                setTimeout(() => setIndex(totalItems - 1), 500); // Tambahkan delay agar animasi smooth
                return 0;
            }
            return prevIndex - 1;
        });
    };

    const nextSlide = () => {
        setIndex((prevIndex) => {
            if (prevIndex === totalItems - 1) {
                setTimeout(() => setIndex(0), 500);
                return totalItems - 1;
            }
            return prevIndex + 1;
        });
    };

    // Ambil 3 item yang akan ditampilkan dalam carousel
    const getVisibleItems = () => {
        const prev = (index - 1 + totalItems) % totalItems;
        const next = (index + 1) % totalItems;
        return [tools[prev], tools[index], tools[next]];
    };

    return (
        <div className="custom-carousel">
            <button onClick={prevSlide} className="carousel-btn left-btn">
                <FaChevronLeft />
            </button>

            <div className="carousel-container">
                <div className="carousel-track">
                    {getVisibleItems().map((tool, i) => (
                        <div key={i} className={`tool-item ${i === 1 ? "active" : ""}`}>
                            <img src={tool.src} alt={tool.name} />
                            <p>{tool.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="carousel-dots">
                {tools.map((_, i) => (
                    <span
                        key={i}
                        className={`dot ${i === index ? "active" : ""}`}
                        onClick={() => setIndex(i)}
                    ></span>
                ))}
            </div>

            <button onClick={nextSlide} className="carousel-btn right-btn">
                <FaChevronRight />
            </button>
        </div>
    );
};

export default ToolCarousel;

