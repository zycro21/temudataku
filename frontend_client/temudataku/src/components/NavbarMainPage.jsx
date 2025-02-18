import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axiosInstanceUser from "./axiosInstanceUser";
import "../assets/styles/navbarMainPage.css";
import { FaInstagram, FaLinkedin, FaWhatsapp, FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useOrder } from "./OrderContext";

const Logo = require("../assets/images/logotemudataku.png");

const NavbarMainPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHeroAtTop, setIsHeroAtTop] = useState(false);

    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [burgerMenuVisible, setBurgerMenuVisible] = useState(false);
    const toggleBurgerMenu = () => {
        setBurgerMenuVisible(prev => !prev);
    };

    const navigate = useNavigate();
    const location = useLocation();

    // Cek halaman saat ini
    const currentPath = location.pathname;
    const isMentoring = currentPath === "/mentoring";
    const isPractice = currentPath === "/practice";

    const { orderCount } = useOrder();

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
        const token = localStorage.getItem("token");

        if (!token) {
            console.log("Token tidak ditemukan, redirect ke login");
            setUser(null);
            return;
        }

        // Cek apakah ada user di localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // Cek apakah token masih valid dengan memanggil API sederhana
        const checkToken = async () => {
            try {
                const storedUser = localStorage.getItem("user");
                const token = localStorage.getItem("token");

                if (!storedUser || !token) return;

                const { user_id } = JSON.parse(storedUser);

                await axiosInstanceUser.get(`/api/users/getUser/${user_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (error) {
                if (error.response?.status === 401) {
                    console.error("Token tidak valid, logout otomatis.");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/";
                } else if (error.response?.status === 404) {
                    console.error("User tidak ditemukan, logout otomatis.");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/";
                } else {
                    console.error("Terjadi kesalahan saat validasi token:", error);
                }
            }
        };

        checkToken();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".burger-menu-navbar") && !event.target.closest(".burger-dropdown-navbar")) {
                setBurgerMenuVisible(false);
            }
        };

        if (burgerMenuVisible) {
            document.addEventListener("click", handleClickOutside);
        } else {
            document.removeEventListener("click", handleClickOutside);
        }

        return () => document.removeEventListener("click", handleClickOutside);
    }, [burgerMenuVisible]);

    const handleLogout = () => {
        const savedEmail = localStorage.getItem("savedEmail");
        const savedPassword = localStorage.getItem("savedPassword");

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Hanya hapus email & password jika "Ingat Saya" tidak digunakan
        if (!savedEmail || !savedPassword) {
            localStorage.removeItem("savedEmail");
            localStorage.removeItem("savedPassword");
        }

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

    // Fungsi untuk fetch data user
    const fetchUserProfile = async () => {
        try {
            const storedUser = localStorage.getItem("user");
            const token = localStorage.getItem("token");

            if (!storedUser || !token) {
                return;
            }

            const parsedUser = JSON.parse(storedUser);
            const { user_id, role } = parsedUser;

            let response;
            if (role === "mentor") {
                response = await axiosInstanceUser.get(`/api/users/getMentorProfile/${user_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                response = await axiosInstanceUser.get(`/api/users/getUser/${user_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            setUserData(response.data.data || response.data);
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Gagal mengambil data profil.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
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

                {/* Burger Menu (Hanya tampil di mobile) */}
                <div className="burger-menu-navbar" onClick={toggleBurgerMenu}>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>

                {/* Burger Dropdown */}
                <div className={`burger-dropdown-navbar ${burgerMenuVisible ? "show" : ""}`}>
                    <Link to="/mentoring" className="burger-item">MENTORING</Link>
                    <Link to="/practice" className="burger-item">PRACTICE</Link>

                    <div className="social-icons-container">
                        <a href="https://instagram.com/temudataku" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <FaInstagram className="icon" />
                        </a>
                        <a href="https://linkedin.com/company/temudataku" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <FaLinkedin className="icon" />
                        </a>
                        <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <FaWhatsapp className="icon" />
                        </a>
                    </div>

                    {/* Order Cart */}
                    <div className="cart-container">
                        <Link to="/orders" className="order-icon">
                            <FaShoppingCart className="icon cart" />
                        </Link>
                        {orderCount > 0 && <span className="cart-badge">{orderCount}</span>}
                    </div>
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
                    {/* Order Cart */}
                    <div className="cart-container">
                        <Link to="/orders" className="order-icon">
                            <FaShoppingCart className="icon cart" />
                            <span className="tooltip">Order</span>
                        </Link>
                        {orderCount > 0 && <span className="cart-badge">{orderCount}</span>}
                    </div>
                </div>

                {/* Login / User Profile */}
                <div className="login-main-page">
                    {user ? (
                        <div className="user-profile">
                            <img
                                src={userData && userData.image ? `http://localhost:8000${userData.image}` : Logo}
                                alt="User Profile"
                                className="user-avatar"
                                onClick={() => setShowDropdown(!showDropdown)}
                            />
                            {showDropdown && (
                                <div className="user-dropdown" ref={dropdownRef}>
                                    <button
                                        onClick={() => {
                                            console.log("Navigating to /profile");
                                            navigate("/profile");
                                        }}
                                    >
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