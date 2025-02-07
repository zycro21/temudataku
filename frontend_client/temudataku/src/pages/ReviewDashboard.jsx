import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../components/SidebarContext";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/reviewDashboard.css";
import Sidebar from "../components/SidebarAdmin";
import LogoSaja from "../assets/images/logosaja.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye, faEdit, faTrashAlt,
    faSortUp, faSortDown
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from "../components/axiosInstance";

const ReviewDashboard = () => {
    // State untuk Fetch Data Review
    const [reviews, setReviews] = useState([]);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [sortOrder, setSortOrder] = useState("");
    const [loading, setLoading] = useState(true);

    // State untuk Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // State untuk modal detail
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [reviewDetail, setReviewDetail] = useState(null);

    // State untuk Modal Update
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateReviewData, setUpdateReviewData] = useState({
        review_id: "",
        rating: 1,
        comment: ""
    });

    const { isOpen } = useSidebar();

    // Fungsi fetch data reviews
    const fetchReviews = async (page = 1) => {
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak ditemukan!");
                return;
            }

            const response = await axiosInstance.get("http://localhost:8000/api/reviews/getAllReviews", {
                params: {
                    q: search,
                    sort_by: sortBy || undefined,
                    sort_order: sortOrder || undefined,
                    currentPage,
                },
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            setReviews(response.data.reviews);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            toast.error("Gagal mengambil data review");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews(currentPage);
    }, [search, sortBy, sortOrder, currentPage]);

    // Fungsi untuk sorting rating
    const handleSort = () => {
        if (!sortBy) {
            // Jika belum ada sorting, set ke "ASC"
            setSortBy("rating");
            setSortOrder("ASC");
        } else if (sortOrder === "ASC") {
            // Jika ASC, ubah ke "DESC"
            setSortOrder("DESC");
        } else {
            // Jika DESC, reset kembali ke default tanpa sorting
            setSortBy("");
            setSortOrder("");
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchReviews(newPage);
        }
    };

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

    // Format tanggal (tanpa waktu)
    const formatDate = (tanggal) => {
        return new Date(tanggal).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    // Fungsi fetch detail reviews
    const fetchReviewDetail = async (review_id) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak ditemukan!");
                return;
            }

            const response = await axiosInstance.get(`http://localhost:8000/api/reviews/getReviewById/${review_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setReviewDetail(response.data);
            setShowDetailModal(true);
        } catch (error) {
            toast.error("Gagal mengambil detail review");
        }
    }

    const handleCloseModal = (modalClass, setShowModal) => {
        const modalOverlay = document.querySelector(`.${modalClass}`);
        if (modalOverlay) {
            modalOverlay.classList.add("hide");

            // Tunggu 300ms sebelum mengubah state agar animasi selesai dulu
            setTimeout(() => {
                setShowModal(false);
            }, 300);
        }
    };
    const openUpdateReviewModal = (review) => {
        setUpdateReviewData({
            review_id: review.review_id,
            rating: review.rating,
            comment: review.comment || "", // Jika komentar kosong, atur default ""
        });
        setShowUpdateModal(true);
    };

    const handleUpdateReview = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak ditemukan!");
                return;
            }

            const response = await axiosInstance.put(
                `http://localhost:8000/api/reviews/updateReviewById/${updateReviewData.review_id}`,
                {
                    rating: updateReviewData.rating,
                    comment: updateReviewData.comment,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(response.data.message);

            // Update data di tabel tanpa reload
            setReviews((prevReviews) =>
                prevReviews.map((review) =>
                    review.review_id === updateReviewData.review_id
                        ? { ...review, rating: updateReviewData.rating, comment: updateReviewData.comment }
                        : review
                )
            );

            setShowUpdateModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal mengupdate review!");
        }
    };

    // Fungsi Delete Review
    const handleDeleteReview = async (reviewId) => {
        const result = await Swal.fire({
            title: "Anda yakin?",
            text: "Review ini akan dihapus secara permanen dan tidak bisa dikembalikan lagi!",
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
                const response = await axiosInstance.delete(`http://localhost:8000/api/reviews/deleteReviewById/${reviewId}`, {
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

                fetchReviews(currentPage);
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
                    <h1>Review Order</h1>

                    <div className="half-2-header-dashboard">

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
                                <th>Review ID</th>
                                <th>Session ID (Sesi)</th>
                                <th>User ID (Pemesan)</th>
                                <th onClick={handleSort} style={{ cursor: "pointer" }}>
                                    Rating{" "}
                                    {sortBy === "rating" && (
                                        <FontAwesomeIcon icon={sortOrder === "ASC" ? faSortUp : faSortDown} />
                                    )}
                                </th>
                                <th>Tanggal Dibuat</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7">Loading...</td></tr>
                            ) : reviews.length > 0 ? (
                                reviews.map((review, index) => (
                                    <tr key={review.review_id}>
                                        <td>{(currentPage - 1) * 10 + index + 1}</td>
                                        <td>{review.review_id}</td>
                                        <td>{review.session_id}</td>
                                        <td>{review.user_id}</td>
                                        <td>{review.rating}</td>
                                        <td>{formatDate(review.created_at)}</td>
                                        <td>
                                            <button
                                                className="action-button btn-detail"
                                                onClick={() => fetchReviewDetail(review.review_id)}
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <button
                                                className="action-button btn-edit"
                                                onClick={() => openUpdateReviewModal(review)}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                className="action-button btn-delete"
                                                onClick={() => handleDeleteReview(review.review_id)}
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7">Tidak ada review yang ditemukan</td>
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

                {/* Modal Detail Review */}
                {showDetailModal && reviewDetail && (
                    <div className={`modal-detail-review-overlay ${showDetailModal ? "show" : "hide"}`}>
                        <div className="modal-detail-review">
                            <h2>Detail Review</h2>
                            <p><strong>Review ID:</strong> {reviewDetail.reviews[0].review_id}</p>
                            <p><strong>Session ID:</strong> {reviewDetail.reviews[0].session_id}</p>
                            <p><strong>Session Title:</strong> {reviewDetail.session_title}</p>
                            <p><strong>Mentor:</strong> {reviewDetail.mentor_name}</p>
                            <p><strong>User ID:</strong> {reviewDetail.reviews[0].user_id}</p>
                            <p><strong>Username:</strong> {reviewDetail.reviews[0].username}</p>
                            <p><strong>Rating:</strong> {reviewDetail.reviews[0].rating}</p>
                            <p><strong>Komentar:</strong> {reviewDetail.reviews[0].comment}</p>
                            <p><strong>Tanggal:</strong> {formatDate(reviewDetail.reviews[0].created_at)}</p>

                            <div className="modal-detail-review-buttons">
                                <button className="modal-detail-review-close-btn" onClick={() => handleCloseModal("modal-detail-review-overlay", setShowDetailModal)}>
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Update Review */}
                {showUpdateModal && (
                    <div className={`modal-update-review-overlay ${showUpdateModal ? "show" : "hide"}`}>
                        <div className="modal-update-review">
                            <h2>Update Review</h2>

                            {/* Form Update Review */}
                            <label>Rating:</label>
                            <input
                                type="number"
                                step="0.1"  // Memungkinkan angka desimal seperti 1.2, 3.5
                                min="0"
                                max="5"
                                value={updateReviewData.rating}
                                onChange={(e) =>
                                    setUpdateReviewData({ ...updateReviewData, rating: parseFloat(e.target.value) })
                                }
                            />

                            <label>Komentar:</label>
                            <textarea
                                value={updateReviewData.comment}
                                onChange={(e) =>
                                    setUpdateReviewData({ ...updateReviewData, comment: e.target.value })
                                }
                            ></textarea>

                            <div className="modal-update-review-buttons">
                                <button onClick={handleUpdateReview} className="btn-save">Simpan</button>
                                <button onClick={() => handleCloseModal("modal-update-review-overlay", setShowUpdateModal)} className="btn-cancel">Batal</button>
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </>
    )
}

export default ReviewDashboard;