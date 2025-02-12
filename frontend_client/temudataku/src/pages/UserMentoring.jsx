import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import NavbarMainPage from "../components/NavbarMainPage";
import FooterMainPage from "../components/FooterMainPage";
import "../assets/styles/userMentoring.css";
import { FaChalkboardTeacher, FaUserGraduate, FaLightbulb } from "react-icons/fa";

const mentoringImg = require("../assets/images/realmentoring.jpg");

const UserMentoring = () => {
    const [activeTab, setActiveTab] = useState("Data Analyst");
    const [isAnimating, setIsAnimating] = useState(false);

    const handleTabChange = (role) => {
        if (activeTab !== role) {
            setIsAnimating(true);
            setTimeout(() => {
                setActiveTab(role);
                setIsAnimating(false);
            }, 300); // Waktu transisi sesuai CSS
        }
    };

    const careerData = {
        "Data Analyst": {
            focus: "Mengumpulkan, membersihkan, dan menganalisis data untuk menemukan pola, tren, dan insight yang berguna bagi bisnis.",
            skills: "Mahir dalam statistik, visualisasi data, SQL, dan alat analisis data seperti Excel, Python, maupun R.",
            responsibilities: [
                "Mengidentifikasi masalah bisnis yang dapat diselesaikan dengan analisis data.",
                "Mengumpulkan data dari berbagai sumber.",
                "Membersihkan dan memvalidasi data.",
                "Menganalisis data menggunakan metode statistik dan visualisasi.",
                "Menyampaikan hasil analisis dalam bentuk laporan atau presentasi yang mudah dipahami."
            ]
        },
        "Data Scientist": {
            focus: "Menggabungkan keahlian statistik, pemrograman, dan pengetahuan bisnis untuk mengekstrak wawasan berharga dari data dan membangun model prediktif.",
            skills: "Mahir dalam statistik, machine learning, pemrograman (Python, R), dan memiliki pemahaman tentang bisnis.",
            responsibilities: [
                "Merumuskan masalah bisnis dan merancang solusi berbasis data.",
                "Mengumpulkan, membersihkan, dan mempersiapkan data.",
                "Mengembangkan, melatih, dan mengevaluasi model machine learning.",
                "Mengkomunikasikan hasil analisis dan model kepada pemangku kepentingan."
            ]
        },
        "Machine Learning Engineer": {
            focus: "Mengembangkan, menerapkan, dan memelihara sistem machine learning dalam skala produksi.",
            skills: "Mahir dalam pemrograman (Python, Java), infrastruktur cloud, dan memiliki pemahaman tentang algoritma machine learning.",
            responsibilities: [
                "Merancang dan mengimplementasikan arsitektur machine learning.",
                "Mengoptimalkan performa dan skalabilitas model machine learning.",
                "Memastikan model machine learning dapat berjalan dengan baik di lingkungan produksi.",
                "Memantau dan memelihara model machine learning yang telah diterapkan."
            ]
        }
    };

    return (
        <>
            <ToastContainer />
            <NavbarMainPage />

            {/* Hero Section */}
            <div className="hero-section-mentoring">
                <div className="overlay"></div>
                <div className="hero-content">
                    <h1 className="animated-title">MENTORING DATA SCIENCE</h1>
                    <button className="cta-button-mentoring">Mulai Mentoring</button>
                </div>
            </div>

            {/* Section Apa yang Akan Kamu Dapatkan */}
            <section className="user-mentoring-info">
                <h2>APA YANG AKAN KAMU DAPATKAN?</h2>
                <p>
                    Kamu akan mendapatkan sesi mentoring yang kamu mau dengan permasalahan yang kamu alami saat ini.
                    Kamu dapat mengajukan mentoring untuk bidang Data Analyst, Data Scientist, dan Machine Learning Engineer.
                </p>

                <div className="mentoring-benefits">
                    <div className="benefit-card">
                        <FaChalkboardTeacher className="benefit-icon" />
                        <h3>Mentor Berpengalaman</h3>
                        <p>Mentor yang telah bekerja di industri dengan pengalaman bertahun-tahun.</p>
                    </div>
                    <div className="benefit-card">
                        <FaUserGraduate className="benefit-icon" />
                        <h3>Materi Terstruktur</h3>
                        <p>Kurikulum mentoring yang dirancang agar mudah dipahami dan diikuti.</p>
                    </div>
                    <div className="benefit-card">
                        <FaLightbulb className="benefit-icon" />
                        <h3>Solusi Tepat Sasaran</h3>
                        <p>Mentoring disesuaikan dengan kebutuhan dan permasalahan spesifikmu.</p>
                    </div>
                </div>
            </section>

            <div className="spacer"></div>

            <section className="career-differences">
                {/* Gambar di sebelah kiri */}
                <div className="career-image">
                    <img src={mentoringImg} alt="Career Illustration" />
                </div>

                {/* Konten di sebelah kanan */}
                <div className="career-content">
                    <h2>APA PERBEDAANNYA?</h2>
                    <div className="career-tabs">
                        {Object.keys(careerData).map((role) => (
                            <button
                                key={role}
                                className={`tab ${activeTab === role ? "active" : ""}`}
                                onClick={() => handleTabChange(role)}
                            >
                                {role}
                            </button>
                        ))}
                    </div>

                    <div className={`career-card ${isAnimating ? "animating" : ""}`}>
                        <h3><span>Fokus Pekerjaan:</span> {careerData[activeTab].focus}</h3>
                        <h3><span>Keahlian:</span> {careerData[activeTab].skills}</h3>
                        <h3><span>Tanggung Jawab:</span></h3>
                        <ul>
                            {careerData[activeTab].responsibilities.map((task, index) => (
                                <li key={index}>{task}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <div className="spacer"></div>

            <section className="mentoring-packages">
                <h2>PILIH PAKET MU</h2>
                <div className="packages-container">
                    <div className="package-card">
                        <h3 className="package-title">Mentoring 1 on 1</h3>
                        <p className="package-price">Rp 49.000</p>
                        <ul className="package-features">
                            <li>✔ Mentoring 45 menit</li>
                            <li>✔ Tanya apapun permasalahan dalam bidang data science</li>
                            <li>✔ Rekaman sesi mentoring</li>
                            <li>✔ Garansi kepuasan*</li>
                            <li>✔ Dapatkan akses ke praktik data science**</li>
                        </ul>
                        <button className="package-btn btn-red">choose plan</button>
                    </div>

                    <div className="package-card">
                        <h3 className="package-title">Mentoring Group</h3>
                        <p className="package-price">Rp 159.000</p>
                        <ul className="package-features">
                            <li>✔ Mentoring 90 menit</li>
                            <li>✔ Tanya apapun permasalahan dalam bidang data science</li>
                            <li>✔ Rekaman sesi mentoring</li>
                            <li>✔ Garansi kepuasan*</li>
                            <li>✔ Dapatkan akses ke praktik data science**</li>
                        </ul>
                        <button className="package-btn btn-green">choose plan</button>
                    </div>
                </div>

                {/* Catatan tambahan */}
                <p className="package-note">
                    * Garansi kepuasan bisa didapatkan jika peserta tidak puas dan mengisi form untuk melakukan klaim garansi serta memberikan bukti valid.<br />
                    ** Untuk peserta yang pertama kali mengikuti mentoring akan mendapatkan akses ke praktik data science.
                </p>
            </section>

            <FooterMainPage />
        </>
    );
};

export default UserMentoring;