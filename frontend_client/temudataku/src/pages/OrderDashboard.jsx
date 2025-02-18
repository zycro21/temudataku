import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../components/SidebarContext";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/orderDashboard.css";
import Sidebar from "../components/SidebarAdmin";
import LogoSaja from "../assets/images/logosaja.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye, faEdit, faTrashAlt,
    faPlus
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from "../components/axiosInstance";

const OrderDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [sortOrder, setSortOrder] = useState("");

    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // State untuk tambah order
    const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        user_id: "",
        session_ids: [],
        status: "pending",
    });
    const [sessions, setSessions] = useState([]);
    const [currentPageSession, setCurrentPageSession] = useState(1);
    const [totalPagesSessions, setTotalPagesSessions] = useState(1);

    // State untuk detail order
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // State untuk update atau edit order
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        status: "",
        session_ids: [],
        total_price: 0,
        order_date: "",
    });

    const { isOpen } = useSidebar();

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak ditemukan!");
                return;
            }

            const response = await axiosInstance.get("http://localhost:8000/api/orders/getAllOrders", {
                params: {
                    search,
                    status: statusFilter,
                    sort_by: sortBy,
                    sort_order: sortOrder,
                    page: currentPage
                },
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            setOrders(response.data.data);
            setTotalPages(response.data.total_pages);
        } catch (error) {
            toast.error("Gagal mengambil data orders");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [search, statusFilter, sortBy, sortOrder, currentPage]);


    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchOrders(newPage);
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
        const statusOptions = ["pending", "confirmed", "completed", "cancelled", ""];
        const currentIndex = statusOptions.indexOf(statusFilter);
        const nextIndex = (currentIndex + 1) % statusOptions.length;
        setStatusFilter(statusOptions[nextIndex]);
    };

    // Handle Klik Tanggal Order
    const handleOrderDateClick = () => {
        setSortBy("order_date");
        setSortOrder(sortOrder === "" ? "asc" : sortOrder === "asc" ? "desc" : "");
    };

    // Handle Klik Total Harga
    const handleTotalPriceClick = () => {
        setSortBy("total_price");
        setSortOrder(sortOrder === "" ? "asc" : sortOrder === "asc" ? "desc" : "");
    };

    // Fungsi Submit Create Order
    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak dapat ditemukan!");
                return;
            }

            // Pastikan session_ids berupa array dan tidak kosong
            if (!Array.isArray(formData.session_ids) || formData.session_ids.length === 0) {
                toast.error("Harap pilih minimal satu sesi.");
                return;
            }

            const response = await axiosInstance.post(
                "http://localhost:8000/api/orders/createOrder",
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success(response.data.message);
            setIsModalCreateOpen(false);
            fetchOrders(currentPage);
        } catch (error) {
            console.error("Error:", error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || "Terjadi kesalahan");
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, selectedOptions } = e.target;

        if (name === "session_ids") {
            // Jika multiple select, ambil semua sesi yang dipilih
            const selectedValues = Array.from(selectedOptions, (option) => option.value);
            setFormData({ ...formData, session_ids: selectedValues });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak ditemukan!");
                return;
            }

            const response = await axiosInstance.get("http://localhost:8000/api/sessions/getAllSessions", {
                params: {
                    page: currentPageSession,
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSessions(response.data.sessions);
            setTotalPagesSessions(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching sessions:", error);
        }
    }

    useEffect(() => {
        fetchSessions();
    }, [currentPageSession]);

    // Handler untuk menangani perubahan checkbox yang dipilih
    const handleCheckboxChange = (sessionId) => {
        setFormData(prevState => {
            const updatedSessionIds = prevState.session_ids.includes(sessionId)
                ? prevState.session_ids.filter(id => id !== sessionId) // Jika sudah ada, hapus
                : [...prevState.session_ids, sessionId]; // Jika belum ada, tambahkan

            return { ...prevState, session_ids: updatedSessionIds };
        });
    };

    const handlePageChangeSession = (page) => {
        setCurrentPageSession(page);
    };

    // Fungsi untuk membuka modal tambah order
    const handleAddOrderClick = () => {
        setFormData({ user_id: "", session_ids: [], status: "pending" });
        setIsModalCreateOpen(true);
    };

    // Fungsi Detail Order
    const handleDetailOrderClick = async (orderId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak ditemukan!");
                return;
            }

            const response = await axiosInstance.get(`http://localhost:8000/api/orders/getOrderById/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            setSelectedOrder(response.data.data);
            setIsModalDetailOpen(true);
        } catch (error) {
            toast.error("Gagal mengambil detail order");
        }
    };

    // Fungsi membuka modal dan mengisi form dengan data dari database
    const openEditOrderModal = (order) => {
        // Ambil session_id dari sessions dan masukkan ke session_ids
        const sessionIds = order.sessions.map(session => session.session_id);

        setSelectedOrder(order);
        setEditFormData({
            status: order.status,
            total_price: order.total_price,
            order_date: order.order_date ? order.order_date.split("T")[0] : "", // Format YYYY-MM-DD
            session_ids: sessionIds || []  // Gunakan session_ids yang sudah diperbaiki
        });
        setIsModalEditOpen(true);
    };

    // Fungsi menangani perubahan input form
    const handleEditInputChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    // Handler untuk menangani perubahan checkbox yang dipilih saat mengedit order
    const handleSessionCheckboxChange = (sessionId) => {
        console.log("Changing sessionId:", sessionId);

        setEditFormData((prevState) => {
            const updatedSessionIds = prevState.session_ids.includes(sessionId)
                ? prevState.session_ids.filter(id => id !== sessionId) // Jika sudah ada, hapus
                : [...prevState.session_ids, sessionId]; // Jika belum ada, tambahkan

            return { ...prevState, session_ids: updatedSessionIds };
        });
    };

    // Fungsi submit input form
    const handleUpdateOrderClick = async (e) => {
        e.preventDefault();

        // Validasi session_ids, pastikan tidak kosong atau format sesuai
        if (editFormData.session_ids.length === 0) {
            toast.error("Harap pilih setidaknya satu sesi");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak dapat ditemukan");
                return;
            }

            const response = await axiosInstance.put(`http://localhost:8000/api/orders/updateOrderById/${selectedOrder.order_id}`,
                editFormData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            toast.success(response.data.message);
            setIsModalEditOpen(false);
            fetchOrders(currentPage);
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal melakukan update data order");
        }
    };


    // Fungsi Delete Order
    const handleDeleteOrder = async (orderId) => {
        const result = await Swal.fire({
            title: "Anda yakin?",
            text: "Order ini akan dihapus secara permanen dan tidak bisa dikembalikan lagi!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("token");
                const response = await axiosInstance.delete(`http://localhost:8000/api/orders/deleteOrderById/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    toast.success(response.data.message, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        draggable: true,
                        progress: undefined,
                    })
                }

                fetchOrders(currentPage);
            } catch (err) {
                console.error("Error delete review: ", err);
                toast.error(
                    err.response?.data?.message ||
                    "Error Ketika Proses Menghapus Review.",
                    {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    }
                );
            }
        }
    }

    return (
        <>
            <div className={`user-dashboard-container ${!isOpen ? "sidebar-closed" : ""}`}>
                <ToastContainer />
                <Sidebar />

                {/* Header Dashboard */}
                <div className="user-dashboard-header">
                    <h1>Dashboard Order</h1>

                    <div className="half-2-header-dashboard">
                        <button className="add-mentor-btn" onClick={() => {
                            handleAddOrderClick();
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
                                <th>Order ID</th>
                                <th>User ID</th>
                                <th>Session</th>
                                <th onClick={handleOrderDateClick} style={{ cursor: "pointer" }}>
                                    Tanggal Order {sortBy === "order_date" && (sortOrder === "asc" ? "🔼" : sortOrder === "desc" ? "🔽" : "")}
                                </th>
                                <th onClick={handleStatusClick} style={{ cursor: "pointer" }}>
                                    Status {statusFilter ? `(${statusFilter})` : ""}
                                </th>
                                <th onClick={handleTotalPriceClick} style={{ cursor: "pointer" }}>
                                    Total Harga {sortBy === "total_price" && (sortOrder === "asc" ? "🔼" : sortOrder === "desc" ? "🔽" : "")}
                                </th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                [...orders] // Salin array agar tidak memodifikasi state langsung
                                    .sort((a, b) => {
                                        if (!sortBy || !sortOrder) return 0;

                                        // Konversi nilai total_price agar bisa diurutkan dengan benar
                                        const valueA = sortBy === "total_price" ? parseFloat(a[sortBy]) : a[sortBy];
                                        const valueB = sortBy === "total_price" ? parseFloat(b[sortBy]) : b[sortBy];

                                        // Urutkan berdasarkan order (ascending/descending)
                                        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
                                    })
                                    .map((order, index) => {
                                        const sessionList = order.sessions.length > 0
                                            ? order.sessions.map(s => (
                                                <li key={s.session_id} style={{
                                                    borderBottom: "1px solid #ddd",
                                                    padding: "5px 0",
                                                    listStyle: "none"
                                                }}>
                                                    {s.session_id} (Mentor: {s.mentor_name || "-"})
                                                </li>
                                            ))
                                            : <li style={{ listStyle: "none" }}>-</li>;

                                        return (
                                            <tr key={order.order_id}>
                                                <td>{(currentPage - 1) * 10 + index + 1}</td>
                                                <td>{order.order_id}</td>
                                                <td>{order.user_id}</td>
                                                <td>
                                                    <ul style={{ padding: 0, margin: 0 }}>{sessionList}</ul>
                                                </td>
                                                <td>{new Date(order.order_date).toLocaleDateString()}</td>
                                                <td>{order.status}</td>
                                                <td>
                                                    {order.total_price
                                                        ? `Rp${parseFloat(order.total_price).toLocaleString('id-ID')}`
                                                        : "-"}
                                                </td>
                                                <td>
                                                    <div className="action-container">
                                                        <button
                                                            className="action-button btn-detail"
                                                            onClick={() => handleDetailOrderClick(order.order_id)}
                                                        >
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </button>
                                                        <button
                                                            className="action-button btn-edit"
                                                            onClick={() => openEditOrderModal(order)}
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </button>
                                                        <button
                                                            className="action-button btn-delete"
                                                            onClick={() => handleDeleteOrder(order.order_id)}
                                                        >
                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center" }}>Tidak ada data yang tersedia</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination page controls */}
                    <div className="user-pagination">
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
                </div>

                {isModalCreateOpen && (
                    <div className="create-order-modal">
                        <div className="create-order-modal-content">
                            <h2>Tambah Order</h2>
                            <form onSubmit={handleSubmitOrder}>
                                <label>User ID:</label>
                                <input
                                    type="text"
                                    name="user_id"
                                    value={formData.user_id}
                                    onChange={handleInputChange}
                                    required
                                />

                                <label>Pilih Sesi:</label>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {sessions.map((session) => (
                                        <div key={session.session_id} className="session-item-order">
                                            <div className="session-info">
                                                <label htmlFor={session.session_id} className="session-title">{session.session_id}</label>
                                            </div>
                                            <div className="checkbox-container">
                                                <input
                                                    type="checkbox"
                                                    id={session.session_id}
                                                    value={session.session_id}
                                                    checked={formData.session_ids.includes(session.session_id)}
                                                    onChange={() => handleCheckboxChange(session.session_id)}
                                                    className="session-checkbox"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pagination-session-order">
                                        {Array.from({ length: totalPagesSessions }, (_, index) => (
                                            <button
                                                key={index + 1}
                                                onClick={() => handlePageChangeSession(index + 1)}
                                                disabled={totalPagesSessions === 1 && index + 1 !== currentPageSession}
                                                className={`page-button ${currentPageSession === index + 1 ? 'active' : ''}`}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <label>Status:</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                <div className="modal-order-create-button-actions">
                                    <button type="submit" className="btn-submit">Submit</button>
                                    <button type="button" className="btn-cancel" onClick={() => setIsModalCreateOpen(false)}>Batal</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Detail Order */}
                {isModalDetailOpen && selectedOrder && (
                    <div className="create-order-modal">
                        <div className="detail-order-modal-content">
                            <h2>Detail Order</h2>
                            <div className="modal-detail-order-grid">
                                <div className="modal-detail-order-left">
                                    <p><strong>Order ID:</strong> {selectedOrder.order_id}</p>
                                    <p><strong>User ID:</strong> {selectedOrder.user_id}</p>
                                    <p><strong>Order Date:</strong> {new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                                    <p><strong>Status:</strong> {selectedOrder.status}</p>
                                    <p><strong>Total Harga:</strong> {selectedOrder.total_price}</p>
                                    <p><strong>Service Type:</strong> {selectedOrder.service_type}</p>
                                </div>
                                <div className="modal-detail-order-right">
                                    <h3>SESI YANG DIPILIH:</h3>
                                    <ul>
                                        {selectedOrder.sessions.map((session, index) => (
                                            <li key={index}>
                                                <strong>Session ID:</strong> {session.session_id}<br />
                                                <strong>Title:</strong> {session.session_title}<br />
                                                <strong>Mentor:</strong> {session.mentor_name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <button className="detail-order-close-modal-btn" onClick={() => setIsModalDetailOpen(false)}>Tutup</button>
                        </div>
                    </div>
                )}

                {isModalEditOpen && selectedOrder && (
                    <div className="edit-order-modal active">
                        <div className="edit-order-modal-content">
                            <h2>Edit Order</h2>
                            <form onSubmit={handleUpdateOrderClick}>
                                <label>Status:</label>
                                <select
                                    name="status"
                                    value={editFormData.status}
                                    onChange={handleEditInputChange}
                                    required
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                <label>Session:</label>
                                <div style={{ maxHeight: '300px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
                                    {sessions.map((session) => (
                                        <div key={session.session_id} className="session-item-order">
                                            <div className="session-info">
                                                <label htmlFor={session.session_id} className="session-title">{session.session_id}</label>
                                            </div>
                                            <div className="checkbox-container">
                                                <input
                                                    type="checkbox"
                                                    // id={session.session_id}
                                                    value={session.session_id}
                                                    checked={editFormData.session_ids.includes(session.session_id)}
                                                    onChange={() => handleSessionCheckboxChange(session.session_id)}
                                                    className="session-checkbox"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <label>Total Harga:</label>
                                <input
                                    type="number"
                                    name="total_price"
                                    value={editFormData.total_price}
                                    onChange={handleEditInputChange}
                                    disabled
                                />

                                <label>Order Date:</label>
                                <input
                                    type="date"
                                    name="order_date"
                                    value={editFormData.order_date || ""}
                                    onChange={handleEditInputChange}
                                />

                                <div className="modal-order-edit-button-actions">
                                    <button type="submit" className="btn-submit">Submit</button>
                                    <button type="button" className="btn-cancel" onClick={() => setIsModalEditOpen(false)}>Batal</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>

        </>
    )
}

export default OrderDashboard;