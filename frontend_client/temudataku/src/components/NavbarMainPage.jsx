import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axiosInstanceUser from "./axiosInstanceUser";
import "../assets/styles/navbarMainPage.css";
import { FaInstagram, FaLinkedin, FaWhatsapp, FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Logo = require("../assets/images/logotemudataku.png");

const NavbarMainPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHeroAtTop, setIsHeroAtTop] = useState(false);

    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    // Cek halaman saat ini
    const currentPath = location.pathname;
    const isMentoring = currentPath === "/mentoring";
    const isPractice = currentPath === "/practice";

    useEffect(() => {
        const handleScroll = () => {
            const heroSection = document.querySelector(".hero-section");
            const navbar = document.querySelector(".navbar");

            if (!heroSection || !navbar) return;

            const heroRect = heroSection.getBoundingClientRect();
            const navbarRect = navbar.getBoundingClientRect();

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

    useEffect(() => {
        // Cek apakah ada user di localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // Cek apakah token masih valid dengan memanggil API sederhana
        const checkToken = async () => {
            try {
                await axiosInstanceUser.get("/users/check-auth"); // Endpoint dummy untuk validasi token
            } catch (error) {
                console.error("Token tidak valid, logout otomatis.");
            }
        };

        checkToken();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);

        toast.success("Logout berhasil! Sampai jumpa lagi.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
        });

        navigate("/");
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className={`navbar ${isScrolled ? "scrolled" : ""} ${isHeroAtTop ? "hero-top" : ""}`}>
            <ToastContainer />
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

                {/* Login / User Profile */}
                <div className="login-main-page">
                    {user ? (
                        <div className="user-profile">
                            <img
                                src={user.profileImage || { Logo }}
                                alt="User Profile"
                                className="user-avatar"
                                onClick={() => setShowDropdown(!showDropdown)}
                            />
                            {showDropdown && (
                                <div className="user-dropdown" ref={dropdownRef}>
                                    <button onClick={() => navigate("/profile")}>
                                        <FaUser className="icon" /> Info User
                                    </button>
                                    <button onClick={handleLogout}>
                                        <FaSignOutAlt className="icon" /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="login-user-page">
                            <FaUser className="icon" />
                            <span className="tooltip-login">Login</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NavbarMainPage;