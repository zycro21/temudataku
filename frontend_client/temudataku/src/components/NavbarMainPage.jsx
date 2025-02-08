import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../assets/styles/navbarMainPage.css";
import Logo from "../assets/images/logotemudataku.png"
import { FaInstagram, FaLinkedin, FaWhatsapp, FaShoppingCart } from "react-icons/fa";

const NavbarMainPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Cek halaman saat ini
    const currentPath = location.pathname;
    const isMentoring = currentPath === "/mentoring";
    const isPractice = currentPath === "/practice";

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={`navbar ${isScrolled ? "scrolled" : ""}`}>
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
                    <FaInstagram className="icon" />
                    <FaLinkedin className="icon" />
                    <FaWhatsapp className="icon" />
                    <div className="cart-container">
                        <FaShoppingCart className="icon cart" />
                        <span className="cart-badge">0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavbarMainPage;