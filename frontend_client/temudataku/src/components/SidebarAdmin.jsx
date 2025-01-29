import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from './SidebarContext'; // Import context
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/sidebarAdmin.css";
import LogoTemuDataku from "../assets/images/logotemudataku.png";
import LogoSaja from "../assets/images/logosaja.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHouse, faUser,
    faChalkboardTeacher,
    faShoppingCart,
    faStar,
    faSignOutAlt,
    faTimes,
    faBars,
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // const [isOpen, setIsOpen] = useState(true);
    const { isOpen, toggleSidebar } = useSidebar();
    const [adminName, setAdminName] = useState("");

    // Ambil Nama Admin dari Local Storage Saat Komponen Dimuat
    useEffect(() => {
        const username = localStorage.getItem("username");
        if (username) {
            setAdminName(username);
        }
    }, []);

    // Fungsi untuk melakukan logout
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token"); // Ambil token dari localStorage
            if (!token) {
                throw new Error("Token tidak ditemukan"); // Pastikan token ada
            }

            // Mengirim request logout dengan header Authorization
            const response = await axios.post(
                "http://localhost:8000/api/users/logout",
                {},
                {
                    headers: {
                        "Authorization": `Bearer ${token}`, // Kirim token dalam header Authorization
                    }
                }
            );

            if (response.status === 200) {
                localStorage.removeItem("token"); // Menghapus token setelah logout
                toast.success("Logout berhasil!", {
                    position: "top-right",
                });
                setTimeout(() => {
                    navigate("/loginAdmin");
                }, 1500);
            }
        } catch (error) {
            toast.error("Terjadi kesalahan saat logout: " + error.message);
        }
    };

    return (
        <div className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>
            {/* Header (Logo & Toggle) */}
            <div className="sidebar-header">
                {isOpen && (
                    <img src={LogoTemuDataku} alt="Logo TemuDataku" className="logo-img" />
                )}
                <button className="toggle-button" onClick={toggleSidebar}>
                    <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
                </button>
            </div>

            {/* Navigation Menu */}
            <ul className="sidebar-item">
                <li className={location.pathname === "/dashboard" ? "active" : ""}>
                    <Link to="/dashboard">
                        <FontAwesomeIcon icon={faHouse} />
                        {isOpen && <span>Dashboard</span>}
                    </Link>
                </li>
                <li className={location.pathname === "/userdashboard" ? "active" : ""}>
                    <Link to="/userdashboard">
                        <FontAwesomeIcon icon={faUser} />
                        {isOpen && <span>User</span>}
                    </Link>
                </li>
                <li className={location.pathname === "/mentorsdashboard" ? "active" : ""}>
                    <Link to="/mentorsdashboard">
                        <FontAwesomeIcon icon={faChalkboardTeacher} />
                        {isOpen && <span>Mentors</span>}
                    </Link>
                </li>
                <li className={location.pathname === "/ordersdashboard" ? "active" : ""}>
                    <Link to="/ordersdashboard">
                        <FontAwesomeIcon icon={faShoppingCart} />
                        {isOpen && <span>Orders</span>}
                    </Link>
                </li>
                <li className={location.pathname === "/reviewsdashboard" ? "active" : ""}>
                    <Link to="/reviewsdashboard">
                        <FontAwesomeIcon icon={faStar} />
                        {isOpen && <span>Reviews</span>}
                    </Link>
                </li>
            </ul>

            {/* Profile Section */}
            <div className="sidebar-profile">
                <img
                    src={LogoSaja}
                    alt="Admin Avatar"
                    className={`avatar-img ${isOpen ? "large" : "small"}`}
                />
                {isOpen && <p className="profile-name">{adminName || "Admin"}</p>}
            </div>

            {/* Logout Button */}
            <div className="sidebar-logout">
                <button onClick={handleLogout} className="logout-button">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    {isOpen && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;