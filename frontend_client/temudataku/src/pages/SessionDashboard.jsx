import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../components/SidebarContext";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/sessionDashboard.css";
import Sidebar from "../components/SidebarAdmin";
import LogoSaja from "../assets/images/logosaja.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye, faEdit, faTrashAlt,
    faPlus
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from "../components/axiosInstance";

const SessionDashboard = () => {
    const { isOpen } = useSidebar();

    // State Fetch Data
    const [sessions, setSessions] = useState([]);
    const [search, setSearch] = useState("");
    const [serviceType, setServiceType] = useState("");
    const [sortBy, setSortBy] = useState(""); // Menggabungkan sorting di sini
    const [sortOrder, setSortOrder] = useState(""); // Urutan ascending atau descending
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // Fetching Data Sessions
    const fetchSessions = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak ditemukan!");
                return;
            }

            const response = await axiosInstance.get("http://localhost:8000/api/sessions/getAllSessions", {
                params: {
                    search,
                    service_type: serviceType,
                    sortBy,
                    sort_order: sortOrder,
                    page: currentPage,
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSessions(response.data.sessions);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [search, serviceType, sortBy, sortOrder, currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchSessions(newPage);
        }
    }

    // Fungsi untuk Generate Pagination
    const generatePagination = () => {
        const pages = [];
        const maxVisiblePages = 4;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 2) {
                pages.push(1, 2, 3, 4, "...");
            } else if (currentPage >= totalPages - 1) {
                pages.push("...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...");
            }
        }

        return pages;
    };

    // Handle Klik Status
    const handleStatusClick = () => {
        const typeOptions = ["one_on_one", "group", "bootcamp", ""];
        const currentIndex = typeOptions.indexOf(serviceType);
        const nextIndex = (currentIndex + 1) % typeOptions.length;
        setServiceType(typeOptions[nextIndex]);
    };

    // Handle Klik Durasi
    const handleDurationClick = () => {
        setSortBy("duration");
        setSortOrder(sortOrder === "" ? "asc" : sortOrder === "asc" ? "desc" : "");
    };

    // Handle Klik Harga
    const handlePriceClick = () => {
        setSortBy("price");
        setSortOrder(sortOrder === "" ? "asc" : sortOrder === "asc" ? "desc" : "");
    };

    // State add sessions
    const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
    const [sessionFormData, setSessionFormData] = useState({
        mentor_id: '',
        title: '',
        description: '',
        price: '',
        duration: '',
        service_type: 'one_on_one'
    });

    // Fungsi buka modal create
    const handleAddSessionClick = () => {
        setSessionFormData({});
        setIsModalCreateOpen(true);
    };

    // Fungsi untuk menangani perubahan input form
    const handleSessionInputChange = (e) => {
        const { name, value } = e.target;
        setSessionFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateSessionSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak ditemukan!");
                return;
            }

            console.log("Data yang dikirim:", sessionFormData); // Log data sebelum submit

            const response = await axiosInstance.post(
                "http://localhost:8000/api/sessions/createSession",
                sessionFormData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success(response.data.message);
            setIsModalCreateOpen(false);
            // Fetch sessions or update your state accordingly
            fetchSessions(currentPage);
        } catch (error) {
            console.error("Error:", error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || "Terjadi kesalahan");
        }
    };

    return (
        <>
            <div className={`user-dashboard-container ${!isOpen ? "sidebar-closed" : ""}`}>
                <ToastContainer />
                <Sidebar />

                {/* Header Dashboard */}
                <div className="user-dashboard-header">
                    <h1>Dashboard Session</h1>

                    <div className="half-2-header-dashboard">
                        <button className="add-mentor-btn" onClick={() => {
                            handleAddSessionClick();
                        }}>
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

                <div className="user-dashboard-main">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Session ID</th>
                                <th>Mentor ID</th>
                                <th>Title</th>
                                <th onClick={handlePriceClick} style={{ cursor: "pointer" }}>
                                    Price {sortBy === "price" && (sortOrder === "asc" ? "🔼" : sortOrder === "desc" ? "🔽" : "")}
                                </th>
                                <th onClick={handleDurationClick} style={{ cursor: "pointer" }}>
                                    Duration(M) {sortBy === "duration" && (sortOrder === "asc" ? "🔼" : sortOrder === "desc" ? "🔽" : "")}
                                </th>
                                <th onClick={handleStatusClick} style={{
                                    cursor: "pointer"
                                }}>
                                    Type {serviceType ? `(${serviceType})` : ""}</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8">Loading...</td>
                                </tr>
                            ) : sessions.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center" }}>
                                        Tidak ada data yang tersedia
                                    </td>
                                </tr>
                            ) : (
                                [...sessions] // Salin array sessions agar tidak mengubah data asli
                                    .sort((a, b) => {
                                        if (!sortBy || !sortOrder) return 0; // Jika tidak ada sorting, urutkan sesuai default

                                        const valueA = sortBy === "total_price" ? parseFloat(a[sortBy]) :
                                            sortBy === "duration" ? parseInt(a[sortBy], 10) :
                                                a[sortBy];
                                        const valueB = sortBy === "total_price" ? parseFloat(b[sortBy]) :
                                            sortBy === "duration" ? parseInt(b[sortBy], 10) :
                                                b[sortBy];

                                        // Sort berdasarkan asc/desc
                                        if (sortOrder === "asc") {
                                            return valueA - valueB;
                                        } else if (sortOrder === "desc") {
                                            return valueB - valueA;
                                        }

                                        return 0;
                                    })
                                    .map((session, index) => (
                                        <tr key={session.session_id}>
                                            <td>{(currentPage - 1) * 10 + index + 1}</td>
                                            <td>{session.session_id}</td>
                                            <td>{session.mentor_id}</td>
                                            <td>{session.title}</td>
                                            <td>{session.total_price
                                                ? `Rp${parseFloat(session.total_price).toLocaleString('id-ID')}`
                                                : "-"}</td>
                                            <td>{session.duration} Minutes</td>
                                            <td>{session.service_type}</td>
                                            <td>
                                                <button
                                                    className="action-button btn-detail"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                                <button
                                                    className="action-button btn-edit"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button
                                                    className="action-button btn-delete"
                                                >
                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination page controls */}
                <div className="user-session-pagination">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        &laquo;
                    </button>

                    {generatePagination().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === "number" && handlePageChange(page)}
                            className={page === currentPage ? "active" : ""}
                            disabled={page === "..."}>
                            {page}
                        </button>
                    ))}

                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        &raquo;
                    </button>
                </div>

                {isModalCreateOpen && (
                    <div className="create-session-modal">
                        <div className="create-session-modal-content">
                            <h2>Tambah Session</h2>
                            <form onSubmit={handleCreateSessionSubmit}>
                                <label>Mentor ID:</label>
                                <input
                                    type="text"
                                    name="mentor_id"
                                    value={sessionFormData.mentor_id}
                                    onChange={handleSessionInputChange}
                                    required
                                />

                                <label>Title:</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={sessionFormData.title}
                                    onChange={handleSessionInputChange}
                                    required
                                />

                                <label>Description: (Opsional)</label>
                                <textarea
                                    name="description"
                                    value={sessionFormData.description}
                                    onChange={handleSessionInputChange}
                                />

                                <label>Price:</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={sessionFormData.price}
                                    onChange={handleSessionInputChange}
                                    required
                                />

                                <label>Duration (in minutes):</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={sessionFormData.duration}
                                    onChange={handleSessionInputChange}
                                    required
                                />

                                <label>Service Type:</label>
                                <select
                                    name="service_type"
                                    value={sessionFormData.service_type}
                                    onChange={handleSessionInputChange}
                                    required
                                >
                                    <option value="one_on_one">One-on-One</option>
                                    <option value="group">Group</option>
                                    <option value="bootcamp">Bootcamp</option>
                                </select>

                                <div className="create-sessions-modal-actions">
                                    <button type="submit" className="btn-submit">Create</button>
                                    <button type="button" className="btn-cancel" onClick={() => setIsModalCreateOpen(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </>
    )
}

export default SessionDashboard;