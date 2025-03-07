import { useState, useEffect } from "react";
import axiosInstanceUser from "../components/axiosInstanceUser";
import { useNavigate } from "react-router-dom";
import styles from "../assets/styles/orderPages.module.css";
import NavbarMainPage from "../components/NavbarMainPage";
import FooterMainPage from "../components/FooterMainPage";

const OrderUserPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) return;

        const fetchUserOrders = async () => {
            try {
                const response = await axiosInstanceUser.get("/api/orders/getOrderByUser", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log("Data Orders dari API:", response.data.data);

                setOrders(response.data.data);
            } catch (error) {
                console.error("Gagal mengambil order:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserOrders();
    }, [token]);

    if (!token) {
        return (
            <>
                <NavbarMainPage />
                <div className={styles.containerUnlogin}>
                    <h1 className={styles.titleUnlogin}>Login Untuk Mengakses Fitur</h1>
                    <button className={styles.loginBtnUnlogin} onClick={() => navigate("/login")}>
                        Login Sekarang
                    </button>
                </div>
                <FooterMainPage />
            </>
        );
    }

    return (
        <>
            <NavbarMainPage />
            <div className={styles.container}>
                <h2 className={styles.title}>Daftar Order Saya</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : orders.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID Order</th>
                                <th>Service Type</th>
                                <th>Status</th>
                                <th>Aksi</th>
                                <th>Review</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.order_id}>
                                    <td>{order.order_id}</td>
                                    <td>{order.service_type}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={styles.detailButton}
                                            onClick={() => navigate(`/order-detail/${order.order_id}`)}
                                        >
                                            Lihat Detail
                                        </button>
                                    </td>
                                    <td>
                                        {order.sessions && order.sessions.length > 0 ? (
                                            <ul className={styles.sessionList}>
                                                {order.sessions.map((session) => (
                                                    <li key={session.session_id} className={styles.sessionItem}>
                                                        <button
                                                            className={styles.reviewButton}
                                                            onClick={() => navigate(`/order-review/${order.order_id}`)}
                                                            disabled={order.status !== "completed"}
                                                        >
                                                            Review Sesi
                                                        </button>
                                                        <span className={styles.sessionTitle}>{session.session_id}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>-</p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Tidak ada order.</p>
                )}
            </div>
            <FooterMainPage />
        </>
    );
};

export default OrderUserPage;