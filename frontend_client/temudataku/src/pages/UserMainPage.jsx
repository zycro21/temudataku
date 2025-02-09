import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "../assets/styles/userMainPage.css";
import NavbarMainPage from "../components/NavbarMainPage";
import FooterMainPage from "../components/FooterMainPage";

const gambar1 = require("../assets/images/main1.jpg");
const gambar2 = require("../assets/images/main2.jpg");
const gambar3 = require("../assets/images/main3.jpg");
const gambar4 = require("../assets/images/main4.jpg");

const UserMainPage = () => {
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
                        <h2 className="animated-title">
                            Belajar Lebih Efektif & Latihan Dari Ahlinya
                        </h2>
                        <p>
                            <strong>TemuDataku</strong> adalah platform mentoring terbaik dalam bidang Data Science.
                            Dapatkan bimbingan dari mentor untuk menjawab keraguanmu dalam belajar data science,
                            baik untuk pemula maupun profesional.
                            <span className="highlight-badge">#1 Mentoring Mengenai Data</span>
                        </p>
                        <button className="btn-outline">View More</button>
                    </div>
                </section>

                <FooterMainPage />
            </div>
        </>
    )
}

export default UserMainPage;