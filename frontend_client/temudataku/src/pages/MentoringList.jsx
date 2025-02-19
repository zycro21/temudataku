import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstanceUser from "../components/axiosInstanceUser";
import { ToastContainer, toast } from "react-toastify";
import NavbarMainPage from "../components/NavbarMainPage";
import FooterMainPage from "../components/FooterMainPage";
import style from "../assets/styles/mentoringList.module.css";

const MentoringList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    let type = queryParams.get("type");

    // Konversi agar cocok dengan format di database
    if (type === "one-on-one") type = "one_on_one";
    if (type === "group") type = "group";
    if (type === "bootcamp") type = "bootcamp";

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    // State Modal
    const [selectedSession, setSelectedSession] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const [selectedSessions, setSelectedSessions] = useState([]);

    const fetchSessions = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axiosInstanceUser.get(`/api/sessions/getAllSessions?service_type=${type}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setSessions(response.data.sessions);
        } catch (error) {
            setError("Gagal mengambil data sesi.");
            toast.error("Gagal mengambil data sesi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) return; // Jika tidak ada token, tidak perlu fetch API
        fetchSessions();
    }, [type, token]);

    // Fetch detail session
    const fetchSessionDetail = async (session_id) => {
        console.log("Fetching session ID:", session_id);
        setModalLoading(true);
        try {
            const response = await axiosInstanceUser.get(`/api/sessions/getSessionById/${session_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedSession(response.data);
            setModalOpen(true);
        } catch (error) {
            toast.error("Gagal mengambil detail sesi.");
        } finally {
            setModalLoading(false);
        }
    };

    const toggleSessionSelection = (session_id) => {
        setSelectedSessions((prev) => {
            if (prev.includes(session_id)) {
                // Jika sudah dipilih, hapus dari daftar
                return prev.filter(id => id !== session_id);
            } else {
                // Jika belum dipilih, tambahkan ke daftar
                return [...prev, session_id];
            }
        });
    };

    // Jika user belum login, tampilkan pesan dan tombol login
    if (!token) {
        return (
            <>
                <NavbarMainPage />
                <div className={style.containerUnlogin}>
                    <h1 className={style.titleUnlogin}>Login Untuk Mengakses Fitur</h1>
                    <button className={style.loginBtnUnlogin} onClick={() => navigate("/login")}>
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
            <div className={style.container}>
                <h1 className={style.title}>
                    {type === "one_on_one"
                        ? "Mentoring 1 on 1"
                        : type === "group"
                            ? "Mentoring Group"
                            : "Bootcamp"}
                </h1>

                {loading && <p className={style.loading}>Loading...</p>}
                {error && <p className={style.error}>{error}</p>}

                {!loading && !error && sessions.length === 0 && (
                    <p className={style.empty}>Tidak ada sesi tersedia.</p>
                )}

                <div className={style.sessionList}>
                    {sessions.map((session) => (
                        <div key={session.session_id} className={style.sessionCard}>
                            <div className={style.sessionHeader}>
                                {session.title || "Judul Tidak Tersedia"}
                            </div>
                            <div className={style.sessionBody}>
                                <p className={style.mentorName}>
                                    Mentor: {session.mentor_name || "Belum Ada Mentor"}
                                </p>
                                <p className={style.price}>
                                    Harga: Rp{Number(session.price).toLocaleString("id-ID")}
                                </p>
                                <p className={style.duration}>
                                    Durasi: {session.duration ? `${session.duration} menit` : "Tidak Diketahui"}
                                </p>

                                {/* Checkbox untuk memilih sesi */}
                                <div className={style.checkboxContainer}>
                                    <input
                                        type="checkbox"
                                        checked={selectedSessions.includes(session.session_id)}
                                        onChange={() => toggleSessionSelection(session.session_id)}
                                    />
                                    <label>Pilih sesi ini</label>
                                </div>

                                <div className={style.buttonGroup}>
                                    <button
                                        className={style.detailBtn}
                                        onClick={() => fetchSessionDetail(session.session_id)}
                                    >
                                        Lihat Detail
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedSessions.length > 0 && (
                    <button
                        className={style.orderBtn}
                        onClick={() => navigate(`/create-order?session_ids=${selectedSessions.join(",")}`)}
                    >
                        Order Sekarang ({selectedSessions.length} sesi)
                    </button>
                )}
            </div>
            <FooterMainPage />

            {/* Modal Detail Session */}
            {modalOpen && selectedSession && (
                <div className={style.modalOverlay} onClick={() => setModalOpen(false)}>
                    <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 className={style.modalTitle}>{selectedSession.title}</h2>
                        <p className={style.modalText}>
                            <strong>Mentor:</strong> {selectedSession.mentor_name || "Belum ada mentor"}
                        </p>
                        <p className={style.modalText}><strong>Deskripsi:</strong> {selectedSession.description}</p>
                        <p className={style.modalText}>
                            <strong>Harga:</strong> Rp{Number(selectedSession.price).toLocaleString("id-ID")}
                        </p>
                        <p className={style.modalText}><strong>Durasi:</strong> {selectedSession.duration} menit</p>
                        <p className={style.modalText}>
                            <strong>Rating:</strong> {selectedSession.rating ? Number(selectedSession.rating).toFixed(1) : "Belum Ada"}
                        </p>
                        <button className={style.closeModal} onClick={() => setModalOpen(false)}>Tutup</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default MentoringList;
