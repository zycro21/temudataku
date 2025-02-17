import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstanceUser from "../components/axiosInstanceUser";
import { ToastContainer, toast } from "react-toastify";
import NavbarMainPage from "../components/NavbarMainPage";
import FooterMainPage from "../components/FooterMainPage";
import style from "../assets/styles/detailOrder.module.css";

const OrderDetail = () => {
    const { order_id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    const fetchOrder = async () => {
        try {
            const response = await axiosInstanceUser.get(`/api/orders/getOrderById/${order_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("Data order dari API:", response.data.data);
            setOrder(response.data.data);
        } catch (error) {
            toast.error("Gagal mengambil data order.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [order_id, navigate]);

    if (loading) return <p className={style.loading}>Loading...</p>;
    if (!order) return <p className={style.loading}>Data tidak ditemukan</p>;

    const waMessage = `Halo, saya ingin mengonfirmasi pembayaran order dengan ID: ${order.order_id}. Berikut detail order-nya:
${order.sessions.map((session, index) => `- Sesi ${index + 1}: ${session.session_title} (Mentor: ${session.mentor_name || "Belum ditentukan"})`).join("\n")}
- Total Harga: Rp ${order.total_price.toLocaleString()}
Mohon konfirmasi pembayaran saya. Terima kasih!`;

    const waLink = `https://wa.me/6285336196913?text=${encodeURIComponent(waMessage)}`;

    return (
        <>
            <NavbarMainPage />
            <div className={style.orderDetailContainer}>
                <h2>Detail Order</h2>
                <p><strong>Order ID:</strong> {order.order_id}</p>

                <div>
                    <strong className={style.sessionTitle}>Sesi yang Dipesan:</strong>
                    {order.sessions && order.sessions.length > 0 ? (
                        <table className={style.sessionTable}>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Session Title</th>
                                    <th>Mentor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.sessions.map((session, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{session.session_title}</td>
                                        <td>{session.mentor_name || "Belum ditentukan"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Tidak ada sesi yang ditemukan.</p>
                    )}
                </div>

                <p><strong>Status:</strong> {order.status}</p>
                <p className={style.totalPrice}><strong>Total Harga:</strong> Rp{order.total_price ? order.total_price.toLocaleString() : "Harga tidak tersedia"}</p>

                <a href={waLink} target="_blank" rel="noopener noreferrer" className={style.waButton}>
                    Konfirmasi Pembayaran via WhatsApp
                </a>
            </div>
            <FooterMainPage />
            <ToastContainer />
        </>
    );
};

export default OrderDetail;
