import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstanceUser from "../components/axiosInstanceUser";
import styles from "../assets/styles/orderReview.module.css";
import NavbarMainPage from "../components/NavbarMainPage";
import FooterMainPage from "../components/FooterMainPage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/loginAdmin.css";

const OrderReview = () => {
    const { order_id } = useParams(); // Mengambil order_id dari URL
    const [sessionId, setSessionId] = useState("");
    const navigate = useNavigate();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axiosInstanceUser.get(`/api/orders/getOrderById/${order_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (response.data.status === "success") {
                    const session = response.data.data.sessions[0]; // Ambil sesi pertama
                    if (session) {
                        setSessionId(session.session_id);
                    } else {
                        toast.error("Session tidak ditemukan dalam order ini.");
                    }
                } else {
                    toast.error("Gagal mengambil data order.");
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Terjadi kesalahan.");
            }
        };
    
        fetchSession();
    }, [order_id]);

    const handleRating = (index) => {
        setRating(index + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!sessionId) {
            toast.error("Session ID tidak valid.");
            return;
        }

        const token = localStorage.getItem("token");

        try {
            // Kirim data review ke API
            await axiosInstanceUser.post(`/api/reviews/createReviews`, {
                order_id,
                session_id: sessionId, // API membutuhkan session_id, menggunakan orderId
                rating,
                comment, // API menggunakan "comment" bukan "review"
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            toast.success("Review berhasil!");
            setTimeout(() => {
                navigate("/orders");
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal mengirim review");
        }
    };

    return (
        <>
        <NavbarMainPage />
        <div className={styles.container}>
            <h2>Review Order #{order_id} {sessionId && `(Session: ${sessionId})`}</h2>
            <form onSubmit={handleSubmit} className={styles.reviewForm}>
                <label>Rating:</label>
                <div className={styles.rating}>
                    {[...Array(5)].map((_, index) => (
                        <span
                            key={index}
                            className={`${styles.star} ${index < rating ? styles.active : ""}`}
                            onClick={() => handleRating(index)}
                        >
                            ★
                        </span>
                    ))}
                </div>
    
                <label>Review:</label>
                <textarea 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)} 
                    required 
                />
    
                <button type="submit" className={styles.submitButton}>Kirim Review</button>
            </form>
        </div>
        <FooterMainPage />
        </>
    );
};

export default OrderReview;
