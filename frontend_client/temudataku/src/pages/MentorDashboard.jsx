import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../components/SidebarContext";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/mentorDashboard.css";
import Sidebar from "../components/SidebarAdmin";
import LogoSaja from "../assets/images/logosaja.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye, faEdit, faTrashAlt,
    faPlus,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from "../components/axiosInstance";

// Modal untuk menampilkan detail mentor
const MentorDetailsModal = ({ mentorDetails, closeModal }) => {
    console.log("Received mentorDetails in modal:", mentorDetails);
    if (!mentorDetails) return null;

    return (
        <div className={`mentor-detail-modal ${mentorDetails ? "open" : ""}`}>
            <div className="mentor-detail-modal-content">
                <span className="mentor-detail-modal-close" onClick={closeModal}>X</span>
                <h2>Detail Mentor</h2>

                {mentorDetails ? (
                    <>
                        <img
                            src={mentorDetails.profile_picture ? `http://localhost:8000${mentorDetails.profile_picture}` : LogoSaja}
                            alt="Mentor"
                            className="mentor-detail-avatar-modal"
                        />
                        <p><strong>Mentor ID:</strong> {mentorDetails.mentor_id}</p>
                        <p><strong>User ID:</strong> {mentorDetails.user_id}</p>
                        <p><strong>Email:</strong> {mentorDetails.email || "Email tidak tersedia"}</p>
                        <p><strong>Username:</strong> {mentorDetails.username || "Username tidak tersedia"}</p>
                        <p><strong>Expertise:</strong> {mentorDetails.expertise || "Belum ada expertise"}</p>
                        <p><strong>Bio:</strong> {mentorDetails.bio || "Belum ada bio"}</p>
                    </>
                ) : (
                    <p className="mentor-detail-error-message">Mentor Details tidak ditemukan!</p>
                )}
            </div>
        </div>
    );
};

const MentorDashboard = () => {
    const [mentors, setMentors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const { isOpen } = useSidebar();

    // State untuk Modal Detail Mentor
    const [mentorDetails, setMentorDetails] = useState(null);
    const [isModalDetailMentorOpen, setIsModalDetailMentorOpen] = useState(false);
    const [loadingDetailMentor, setLoadingDetailMentor] = useState(false);

    // State untuk register mentor
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
    });

    useEffect(() => {
        fetchMentors();
    }, [currentPage, search]);

    const fetchMentors = async (page = 1) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak dapat ditemukan");
                return;
            }

            const response = await axiosInstance.get(
                `http://localhost:8000/api/users/getAllUsers?role=mentor&page=${currentPage}&limit=10&search=${search}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
            );

            if (response.status === 200) {
                setMentors(response.data.data);

                // HITUNG TOTAL HALAMAN SENDIRI BERDASARKAN JUMLAH MENTOR
                const totalMentors = response.data.data.length; // Jumlah mentor yang diterima dari API
                const calculatedTotalPages = Math.ceil(totalMentors / 10); // 10 mentor per halaman

                setTotalPages(calculatedTotalPages || 1); // Minimal tetap 1 halaman
            }
        } catch (error) {
            toast.error("Gagal mengambil data mentor!");
            console.error("Error fetching mentors:", error);
        }
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const generatePagination = () => {
        let pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    // Membuka modal untuk create mentor
    const handleAddMentorClick = () => {
        setIsModalOpen(true);
    };

    // Fungsi menangani perubahan input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Fungsi submit register mentor
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, username, password } = formData;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak dapat ditemukan!");
                return;
            }

            const response = await axiosInstance.post(
                "http://localhost:8000/api/users/register",
                {
                    email,
                    username,
                    password,
                    role: "mentor", // Set otomatis menjadi 'mentor'
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Mentor berhasil didaftarkan!");
            setIsModalOpen(false);
            fetchMentors(currentPage);
        } catch (error) {
            console.error("Gagal registrasi mentor:", error);
            toast.error(error.response?.data?.message || "Terjadi kesalahan, coba lagi.");
        }
    };

    // Fungsi Detail User
    const handleDetailMentors = async (userId) => {
        setLoadingDetailMentor(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak dapat ditemukan!");
                return;
            }

            const response = await axiosInstance.get(`http://localhost:8000/api/users/getMentorProfile/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200 && response.data) {
                const mentorData = response.data;

                // Update state mentorDetails terlebih dahulu
                setMentorDetails(mentorData);

                // Setelah state mentorDetails terupdate, buka modal
                setIsModalDetailMentorOpen(true);
            } else {
                toast.error("Data mentor tidak ditemukan!");
            }
        } catch (error) {
            toast.error("Gagal mengambil data mentor: " + error.message);
        } finally {
            setLoadingDetailMentor(false);
        }
    };

    return (
        <>
            <div className={`user-dashboard-container ${!isOpen ? "sidebar-closed" : ""}`}>
                <ToastContainer />
                <Sidebar />

                {/* Header Dashboard */}
                <div className="user-dashboard-header">
                    <h1>Dashboard Mentor</h1>
                    {/* Tombol Tambah Mentor */}
                    <div className="half-2-header-dashboard">
                        <button className="add-mentor-btn" onClick={handleAddMentorClick}>
                            <FontAwesomeIcon icon={faPlus} />
                        </button>

                        {/* Search Bar */}
                        <input
                            type="text"
                            placeholder="Search..."
                            className="user-search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid Mentor Cards */}
                <div className="user-dashboard-main">
                    <div className="mentor-grid">
                        {mentors.map((mentor) => (
                            <div className="mentor-card" key={mentor.user_id}>
                                <img src={mentor.image ? `http://localhost:8000${mentor.image}` : LogoSaja} alt={mentor.mentor_name} className="mentor-image" />
                                <h3>{mentor.mentor_name || "Nama belum di update"}</h3>
                                <p>{mentor.email}</p>
                                <button className="detail-btn-mentor" onClick={() => handleDetailMentors(mentor.user_id)}>
                                    <FontAwesomeIcon icon={faEye} /> Lihat Detail
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Pagination page controls */}
                    <div className="user-pagination">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            &laquo;
                        </button>

                        {generatePagination().map((page, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageChange(page)}
                                className={page === currentPage ? "active" : ""}
                                disabled={page === "..."}>
                                {page}
                            </button>
                        ))}

                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                            &raquo;
                        </button>
                    </div>
                </div>

                {/* Modal untuk detail user */}
                {isModalDetailMentorOpen && <MentorDetailsModal mentorDetails={mentorDetails} closeModal={() => setIsModalDetailMentorOpen(false)} />}

                {/* Modal untuk create mentor */}
                {isModalOpen && (
                    <div className="create-mentor-modal">
                        <div className="create-mentor-modal-content">
                            <h2>Tambah Mentor</h2>
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="button-group">
                                    <button type="submit">Daftar Mentor</button>
                                    <button type="button" onClick={() => setIsModalOpen(false)}>Tutup</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}


            </div>
        </>
    )
};

export default MentorDashboard;