import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../assets/styles/navbarMainPage.css";
import { FaInstagram, FaLinkedin, FaWhatsapp, FaShoppingCart, FaUser } from "react-icons/fa";

const Logo = require("../assets/images/logotemudataku.png");

const NavbarMainPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHeroAtTop, setIsHeroAtTop] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Cek halaman saat ini
    const currentPath = location.pathname;
    const isMentoring = currentPath === "/mentoring";
    const isPractice = currentPath === "/practice";
    const isLogin = currentPath === "/login";

    useEffect(() => {
        const handleScroll = () => {
            const heroSection = document.querySelector(".hero-section");
            const navbar = document.querySelector(".navbar");

            if (!heroSection || !navbar) return;

            const heroRect = heroSection.getBoundingClientRect();
            const navbarRect = navbar.getBoundingClientRect();

            // ✅ Correct logic: Navbar is above hero when its bottom is inside the hero section
            const isHeroAtTop = navbarRect.bottom > heroRect.top && navbarRect.top < heroRect.bottom;

            if (isHeroAtTop) {
                navbar.classList.add("hero-top");
            } else {
                navbar.classList.remove("hero-top");
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Run once on mount

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={`navbar ${isScrolled ? "scrolled" : ""} ${isHeroAtTop ? "hero-top" : ""}`} onClick={() => console.log("Classes:", isScrolled, isHeroAtTop)}>
            <div className="navbar-container">
                {/* Logo (Klik untuk kembali ke Home) */}
                <div className="navbar-logo" onClick={() => navigate("/")}>
                    <img src={Logo} alt="TemuDataku Logo" />
                </div>

                {/* Menu Links */}
                <div className="navbar-links">
                    <Link to="/mentoring" className={isMentoring ? "active" : ""}>
                        MENTORING
                    </Link>
                    <Link to="/practice" className={isPractice ? "active" : ""}>
                        PRACTICE
                    </Link>
                </div>

                {/* Social Media & Cart */}
                <div className="navbar-icons">
                    <a href="https://instagram.com/temudataku" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <FaInstagram className="icon" />
                        <span className="tooltip">Instagram</span>
                    </a>
                    <a href="https://linkedin.com/company/temudataku" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <FaLinkedin className="icon" />
                        <span className="tooltip">LinkedIn</span>
                    </a>
                    <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <FaWhatsapp className="icon" />
                        <span className="tooltip">WhatsApp</span>
                    </a>
                    <div className="cart-container">
                        <Link to="/order" className="order-icon">
                            <FaShoppingCart className="icon cart" />
                            <span className="tooltip">Order</span>
                        </Link>
                        <span className="cart-badge">0</span>
                    </div>
                </div>

                <div className="login-main-page">
                    <Link to="/login" className="login-user-page">
                        <FaUser className="icon" />
                        <span className="tooltip-login">Login</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NavbarMainPage;