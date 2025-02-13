import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import NavbarMainPage from "../components/NavbarMainPage";
import FooterMainPage from "../components/FooterMainPage";
import style from "../assets/styles/userPractice.module.css";
import { FaChartLine, FaBrain, FaUsers, FaTrophy, FaChartBar, FaRobot, FaDatabase, FaLaptopCode, FaClock } from "react-icons/fa";

const UserPractice = () => {
    const quotes = [
        "Ilmu data bukan hanya tentang angka, tapi bagaimana mengubah data menjadi wawasan berharga.",
        "Data tanpa analisis adalah angka tanpa arti.",
        "Kualitas keputusan tergantung pada kualitas datamu.",
        "Machine Learning adalah seni menemukan pola dalam data.",
        "Setiap dataset memiliki cerita yang menunggu untuk ditemukan.",
        "Kemampuan membaca data adalah keterampilan abad ke-21.",
        "Data yang baik membawa keputusan yang baik.",
        "Statistik adalah alat untuk memahami dunia.",
        "Visualisasi data adalah jembatan antara angka dan wawasan.",
        "Data science bukan hanya tentang coding, tapi juga tentang pemecahan masalah.",
        "Jangan percaya data mentah, analisis sebelum mengambil keputusan.",
        "Dunia dipenuhi oleh data, hanya sedikit yang bisa memahami artinya.",
        "Big Data bukan tentang ukuran, tetapi tentang nilai yang bisa diperoleh.",
        "Menjadi Data Scientist bukan tentang gelar, tapi tentang keingintahuan.",
        "Menggunakan data dengan benar dapat mengubah masa depan bisnis.",
        "Kunci sukses dalam Data Science adalah eksperimen tanpa henti.",
        "Data adalah bahan bakar revolusi industri ke-4.",
        "Dalam dunia digital, data adalah mata uang baru.",
        "Belajar Data Science berarti belajar memahami dunia.",
        "Tanpa data, opini hanyalah asumsi."
    ];

    const [currentQuote, setCurrentQuote] = useState(quotes[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * quotes.length);
            setCurrentQuote(quotes[randomIndex]);
        }, 5 * 60 * 1000); // 5 menit

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <ToastContainer />
            <NavbarMainPage />

            {/* Hero Section */}
            <section className={style.hero}>
                <div className={style.overlay}></div>
                <div className={style.content}>
                    <h1 className={style.title}>DATA SCIENCE PRACTICE</h1>
                    <p className={style.subtitle}>
                        Tingkatkan skill data science dengan latihan berbasis studi kasus nyata.
                    </p>
                    <button className={style.ctaButton}>Mulai Praktik</button>
                </div>
            </section>

            {/* Section 2 - Apa yang Akan Kamu Dapatkan */}
            <section className={style.benefitSection}>
                <h2 className={style.sectionTitle}>Apa yang Akan Kamu Dapatkan?</h2>
                <p className={style.sectionSubtitle}>
                    Bangun keterampilan data science dari dasar hingga mahir dengan studi kasus nyata.
                </p>

                {/* Bungkus benefitGrid & quoteContainer agar sejajar */}
                <div className={style.benefitWrapper}>
                    {/* Benefit Cards */}
                    <div className={style.benefitGrid}>
                        <div className={style.benefitCard}>
                            <FaChartLine className={style.benefitIcon} />
                            <h3>Hands-on Project</h3>
                            <p>Latihan berbasis proyek nyata untuk meningkatkan pengalaman.</p>
                        </div>

                        <div className={style.benefitCard}>
                            <FaBrain className={style.benefitIcon} />
                            <h3>Pemahaman Mendalam</h3>
                            <p>Materi yang dirancang agar kamu memahami konsep secara mendalam.</p>
                        </div>

                        <div className={style.benefitCard}>
                            <FaUsers className={style.benefitIcon} />
                            <h3>Mentoring & Support</h3>
                            <p>Dapatkan dukungan dari mentor dan komunitas.</p>
                        </div>

                        <div className={style.benefitCard}>
                            <FaTrophy className={style.benefitIcon} />
                            <h3>Sertifikat Kompetensi</h3>
                            <p>Dapatkan sertifikat untuk meningkatkan kredibilitas.</p>
                        </div>
                    </div>

                    {/* Quote Section */}
                    <div className={style.quoteContainer}>
                        <p className={style.quoteText}>
                            "{currentQuote}"
                        </p>
                        <span className={style.quoteAuthor}>- TemuDataku</span>
                    </div>
                </div>
            </section>

            <div className="spacer"></div>

            <section className={style.practiceSection}>
                <h2 className={style.sectionTitle}>Latihan Praktik Data Science</h2>
                <p className={style.sectionSubtitle}>
                    Pilih studi kasus yang ingin kamu pelajari dan mulai praktik dengan dataset nyata.
                </p>

                <div className={style.practiceGrid}>
                    {/* Data Card */}
                    {[
                        {
                            icon: <FaChartBar />,
                            title: "Data Analysis - Customer Analysis",
                            desc: "Kamu akan belajar cara menganalisis pelanggan, mencari tren tersembunyi, dan melihat prospek ke depan.",
                            active: true
                        },
                        {
                            icon: <FaRobot />,
                            title: "Machine Learning - NLP",
                            desc: "Kamu akan belajar cara mengolah teks, menganalisis sentimen, dan melakukan klasifikasi teks.",
                            active: false
                        },
                        {
                            icon: <FaDatabase />,
                            title: "Data Scientist - Churn Prediction",
                            desc: "Membuat model prediksi untuk melihat kemungkinan pelanggan melakukan churn.",
                            active: false
                        },
                        {
                            icon: <FaBrain />,
                            title: "Machine Learning - Classification",
                            desc: "Memproses data dengan feature engineering, encoding, dan label classification.",
                            active: true
                        },
                        {
                            icon: <FaLaptopCode />,
                            title: "Machine Learning - Computer Vision",
                            desc: "Belajar mengolah gambar dan membuat klasifikasi menggunakan dataset yang disediakan.",
                            active: false
                        },
                        {
                            icon: <FaClock />,
                            title: "Machine Learning - Time Series",
                            desc: "Pemrosesan data time series dan pembuatan model dengan neural network.",
                            active: false
                        },
                    ].map((card, index) => (
                        <div key={index} className={style.practiceCard}>
                            <div className={style.practiceCardHeader}>{card.icon}</div>
                            <div className={style.practiceCardBody}>
                                <h3>{card.title}</h3>
                                <p>{card.desc}</p>
                                <button className={card.active ? style.activeButton : style.disabledButton}>
                                    {card.active ? "Ambil Praktik Ini" : "Coming Soon"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <FooterMainPage />
        </>
    );
};

export default UserPractice;

