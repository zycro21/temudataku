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
        session_id: "",
        status: "pending",
    });

    // State untuk detail order
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // State untuk update atau edit ordwer
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        status: "",
        session_id: "",
        total_price: "",
        order_date: "",
        service_type: ""
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
                    sortBy,
                    sort_order: sortOrder,
                    currentPage
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

    // Fungsi Submit Creat Order
    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak dapat ditemukan!");
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddOrderClick = () => {
        console.log("Modal Dibuka");
        setFormData({});
        setIsModalCreateOpen(true);
    }

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
        console.log("Selected Order:", order); // Debugging
        setSelectedOrder(order);
        setEditFormData({
            status: order.status,
            session_id: order.session_id,
            total_price: order.total_price,
            order_date: order.order_date ? order.order_date.split("T")[0] : "", // Format YYYY-MM-DD
            service_type: order.service_type
        });
        setIsModalEditOpen(true);
    };

    // Fungsi menangani perubahan input form
    const handleEditInputChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    // Fungsi submit input form
    const handleUpdateOrderClick = async (e) => {
        e.preventDefault();

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
                                <th>Session ID</th>
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
                                [...orders] // Salin array orders untuk menghindari mutasi data asli
                                    .sort((a, b) => {
                                        if (!sortBy || !sortOrder) return 0; // Jika tidak ada sorting, urutkan sesuai default

                                        // Convert to number untuk kolom harga dan tanggal
                                        const valueA = sortBy === "total_price" ? parseFloat(a[sortBy]) : a[sortBy];
                                        const valueB = sortBy === "total_price" ? parseFloat(b[sortBy]) : b[sortBy];

                                        // Sort based on ascending/descending order
                                        if (sortOrder === "asc") {
                                            return valueA - valueB;
                                        } else if (sortOrder === "desc") {
                                            return valueB - valueA;
                                        }

                                        return 0;
                                    })
                                    .map((order, index) => (
                                        <tr key={order.order_id}>
                                            <td>{(currentPage - 1) * 10 + index + 1}</td>
                                            <td>{order.order_id}</td>
                                            <td>{order.user_id}</td>
                                            <td>{order.session_id}</td>
                                            <td>{new Date(order.order_date).toLocaleDateString()}</td>
                                            <td>{order.status}</td>
                                            <td>
                                                {order.total_price
                                                    ? `Rp${parseFloat(order.total_price).toLocaleString('id-ID')}`
                                                    : "-"}
                                            </td>
                                            <td>
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
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center" }} >Tidak ada data yang tersedia</td>
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

                                <label>Session ID:</label>
                                <input
                                    type="text"
                                    name="session_id"
                                    value={formData.session_id}
                                    onChange={handleInputChange}
                                    required
                                />

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

                {isModalDetailOpen && selectedOrder && (
                    <div className="create-order-modal">
                        <div className="detail-order-modal-content">
                            <h2>Detail Order</h2>
                            <div className="modal-detail-order-grid">
                                <div className="modal-detail-order-left">
                                    <p><strong>Order ID:</strong> {selectedOrder.order_id}</p>
                                    <p><strong>User ID:</strong> {selectedOrder.user_id}</p>
                                    <p><strong>Session ID:</strong> {selectedOrder.session_id}</p>
                                    <p><strong>Session Title:</strong> {selectedOrder.session_title}</p>
                                </div>
                                <div className="modal-detail-order-right">
                                    <p><strong>Mentor:</strong> {selectedOrder.mentor_name}</p>
                                    <p><strong>Order Date:</strong> {new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                                    <p><strong>Status:</strong> {selectedOrder.status}</p>
                                    <p><strong>Total Harga:</strong> {selectedOrder.total_price}</p>
                                    <p><strong>Service Type:</strong> {selectedOrder.service_type}</p>
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

                                <label>Session ID:</label>
                                <input
                                    type="text"
                                    name="session_id"
                                    value={editFormData.session_id}
                                    onChange={handleEditInputChange}
                                    required
                                />

                                <label>Total Harga:</label>
                                <input
                                    type="number"
                                    name="total_price"
                                    value={editFormData.total_price}
                                    onChange={handleEditInputChange}
                                    required
                                />

                                <label>Order Date:</label>
                                <input
                                    type="date"
                                    name="order_date"
                                    value={editFormData.order_date ? editFormData.order_date : ""}
                                    onChange={handleEditInputChange}
                                />

                                <label>Service Type:</label>
                                <select
                                    name="status"
                                    value={editFormData.service_type}
                                    onChange={handleEditInputChange}
                                    required
                                >
                                    <option value="one_on_one">One on one</option>
                                    <option value="bootcamp">Bootcamp</option>
                                    <option value="group">Group</option>
                                </select>

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