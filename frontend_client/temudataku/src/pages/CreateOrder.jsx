import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstanceUser from "../components/axiosInstanceUser";
import { ToastContainer, toast } from "react-toastify";
import NavbarMainPage from "../components/NavbarMainPage";
import FooterMainPage from "../components/FooterMainPage";
import style from "../assets/styles/createOrder.module.css";

// Fungsi untuk decode token di luar komponen agar lebih efisien
const decodeToken = (token) => {
    if (!token) return null;
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
};

const CreateOrder = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const session_ids = queryParams.get("session_ids"); // Ambil session_ids dari query parameter

    const [user, setUser] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const token = localStorage.getItem("token");
    const userDataT = decodeToken(token);
    const userId = userDataT?.user_id;

    useEffect(() => {
        if (!token || !userId) {
            toast.error("Silakan login terlebih dahulu.");
            navigate("/login");
            return;
        }

        if (!session_ids) {
            toast.error("Tidak ada sesi yang dipilih.");
            navigate("/mentoring");
            return;
        }

        const fetchData = async () => {
            try {
                // Ambil data user
                const userResponse = await axiosInstanceUser.get(`/api/users/getUser/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUser(userResponse.data);

                // Ambil data semua sesi yang dipilih
                const sessionIdArray = session_ids.split(",");
                const sessionResponses = await Promise.all(
                    sessionIdArray.map((id) =>
                        axiosInstanceUser.get(`/api/sessions/getSessionById/${id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                    )
                );

                setSessions(sessionResponses.map(res => res.data));
            } catch (error) {
                toast.error("Gagal mengambil data, silakan coba lagi.");
                navigate("/mentoring"); // Redirect jika gagal
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session_ids, navigate, token, userId]);

    const handleCreateOrder = async () => {
        if (!user || sessions.length === 0 || isLoading) return;

        try {
            setIsLoading(true);

            const orderData = {
                user_id: user?.data?.user_id, // Pastikan ini benar
                session_ids: session_ids.split(","), // Kirim array session_id
                status: "pending",
            };

            const response = await axiosInstanceUser.post("/api/orders/createOrder", orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data?.order_id) {
                toast.success("Order berhasil dibuat!");
                setTimeout(() => navigate(`/order-detail/${response.data.order_id}`), 2000);
            } else {
                toast.error("Gagal mendapatkan ID order. Silakan coba lagi.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Terjadi kesalahan.");
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) return <p className={style.loading}>Loading...</p>;

    return (
        <>
            <NavbarMainPage />
            <div className={style.orderContainer}>
                <h2 className={style.orderTitle}>Order Summary</h2>
                <p className={style.orderText}>Silakan review pesanan Anda.</p>

                <table className={style.orderTable}>
                    <thead>
                        <tr>
                            <th>Deskripsi Pembelian</th>
                            <th>Jumlah</th>
                            <th>Harga</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((session, index) => (
                            <tr key={index}>
                                <td data-label="Deskripsi Pembelian">
                                    <strong>{session.title}</strong> <br />
                                    <small>{session.mentor_name || "Mentor belum ditentukan"}</small>
                                </td>
                                <td data-label="Jumlah">1</td>
                                <td data-label="Harga">
                                    <strong>Rp{Number(session.price).toLocaleString("id-ID")}</strong>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <p className={style.totalPrice}>
                    Total: <strong>Rp{sessions.reduce((acc, session) => acc + Number(session.price), 0).toLocaleString("id-ID")}</strong>
                </p>

                <button className={style.orderBtn} onClick={handleCreateOrder} disabled={isLoading}>
                    {isLoading ? "Memproses..." : `Buat Order (${sessions.length} sesi)`}
                </button>
            </div>

            <FooterMainPage />
        </>
    );
};

export default CreateOrder;
