import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "../assets/styles/userMainPage.css";
import NavbarMainPage from "../components/NavbarMainPage";
import FooterMainPage from "../components/FooterMainPage";
import ToolCarousel from "../components/ToolsCarousel";

const gambar1 = require("../assets/images/main1.jpg");
const gambar2 = require("../assets/images/main2.jpg");
const gambar3 = require("../assets/images/main3.jpg");
const gambar4 = require("../assets/images/main4.jpg");
const gambar5 = require("../assets/images/content4.jpg");
const gambar6 = require("../assets/images/content4-2.jpg");

const UserMainPage = () => {
    const [openFAQ, setOpenFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    const faqData = [
        {
            question: "Apa yang saya dapatkan nanti setelah mentoring?",
            answer: "Tentu kamu akan mendapatkan penjelasan materi yang belum kamu pahami dari mentor yang ahli di bidangnya."
        },
        {
            question: "Apakah saya bisa mentoring secara berkelompok?",
            answer: "Ya, tersedia sesi mentoring baik secara individu maupun berkelompok sesuai kebutuhanmu."
        },
        {
            question: "Layanan apa saja yang ada di TemuDataku?",
            answer: "Kami menyediakan berbagai layanan seperti mentoring 1-on-1, mentoring kelompok, dan project assistance di bidang Data Science."
        },
        {
            question: "Data seperti apa yang disediakan oleh TemuDataku?",
            answer: "Kami menyediakan materi, dataset, dan pembelajaran yang berkaitan dengan Data Science, Machine Learning, dan Analisis Data."
        }
    ];

    return (
        <>
            <div className="mainpage-user">
                <ToastContainer />
                <NavbarMainPage />

                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-overlay">
                        <div className="hero-content">
                            <h2 className="fade-in-up">BOSAN BELAJAR DATA SCIENCE SENDIRIAN?</h2>
                            <h1 className="fade-in-up delay-1">Yuk, Temu Mentor di <span>TemuDataku!</span></h1>
                            <div className="hero-buttons fade-in-up delay-2">
                                <button className="btn-primary">Coba Sekarang</button>
                                <button className="btn-secondary">Kontak Kami</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Spacer between Hero and Content */}
                <div className="spacer"></div>

                {/* Second Content Section */}
                <section className="second-content">
                    <div className="content-grid">
                        <div className="grid-item">
                            <img src={gambar1} alt="1 on 1 Session dengan mentor" />
                            <p>1 on 1 Session dengan mentor</p>
                        </div>
                        <div className="grid-item">
                            <img src={gambar2} alt="Akselerasi Impian" />
                            <p>Akselerasi Impian</p>
                        </div>
                        <div className="grid-item">
                            <img src={gambar3} alt="Perdalam latihan dengan ulasan mentor" />
                            <p>Perdalam latihan dengan ulasan mentor</p>
                        </div>
                        <div className="grid-item">
                            <img src={gambar4} alt="Harga Terjangkau" />
                            <p>Harga terjangkau</p>
                        </div>
                    </div>

                    <div className="content-text">
                        <h2 className="animated-title">Belajar lebih efektif & latihan langsung dari ahlinya</h2>

                        <div className="mentoring-container">
                            <div className="number-one">
                                <span className="small-hash">#</span>
                                <span className="big-number">1</span>
                            </div>
                            <div className="mentoring-text">
                                <h3 className="mentoring-title">Terbaik dalam Mentoring Data Science</h3>
                                <p>
                                    Dapatkan bimbingan dari mentor untuk menjawab keraguanmu dalam belajar data science.
                                    Khusus untuk kamu yang belajar otodidak, kami memberikan akses 1-on-1 maupun kelompok
                                    untuk mentoring dan tentu dengan harga yang lebih terjangkau.
                                </p>
                            </div>
                        </div>

                        <button className="btn-outline">View More</button>
                    </div>
                </section>

                <div className="spacer"></div>

                {/* Third Content Section */}
                <section className="third-content">
                    <h2 className="third-content-title">Kuasai Tools di bidang Data Science</h2>

                    <ToolCarousel />
                </section>

                <div className="spacer"></div>

                <div className="fourth-section">
                    <h2 className="fourth-content-title">Layanan TemuDataku</h2>
                    <p className="fourth-content-desc">
                        Temukan berbagai layanan unggulan yang kami tawarkan untuk membantumu berkembang di dunia Data Science.
                    </p>

                    {/* Container untuk dua card di atas */}
                    <div className="service-container">
                        <div className="service-card">
                            <img src={gambar6} alt="1 on 1 & Group Mentoring" />
                            <div className="service-overlay">
                                <p>1 on 1 & Group Mentoring</p>
                                <button className="service-btn">Lihat Detail</button>
                            </div>
                        </div>
                        <div className="service-card">
                            <img src={gambar5} alt="Data Science Practice" />
                            <div className="service-overlay">
                                <p>Data Science Practice</p>
                                <button className="service-btn">Lihat Detail</button>
                            </div>
                        </div>
                    </div>

                    {/* Card Besar di Bawah */}
                    <div className="service-large-card">
                        <div className="service-large-content">
                            <div className="service-large-icon">
                                ✅ {/* Bisa diganti dengan <img> jika ada ikon */}
                            </div>
                            <div className="service-large-text">
                                <h3>Bangun Portofolio dengan Data Science Practice</h3>
                                <p>
                                    Tersedia berbagai macam studi kasus yang bisa kamu coba dan explore untuk membangun portofolio kamu.
                                </p>
                            </div>
                        </div>
                        <button className="service-large-btn">Coba Sekarang</button>
                    </div>
                </div>


                <div className="spacer"></div>

                {/* Fifth Content Section - FAQ */}
                <div className="faq-section">
                    <h2 className="faq-title">FAQ</h2>
                    <div className="faq-container">
                        {faqData.map((faq, index) => (
                            <div key={index} className="faq-item">
                                <button className="faq-question" onClick={() => toggleFAQ(index)}>
                                    {faq.question}
                                    <span className={`faq-icon ${openFAQ === index ? "open" : ""}`}>▾</span>
                                </button>
                                <div className={`faq-answer ${openFAQ === index ? "show" : ""}`}>
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <FooterMainPage />
            </div>
        </>
    )
}

export default UserMainPage;