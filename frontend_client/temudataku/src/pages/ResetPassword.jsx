import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import styles from "../assets/styles/resetPassword.module.css";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            toast.error("Password minimal 8 karakter.");
            return;
        }
        if (!/\d/.test(newPassword)) {
            toast.error("Password harus mengandung angka.");
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
            toast.error("Password harus mengandung simbol.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Password dan konfirmasi password tidak cocok.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `http://localhost:8000/api/users/reset-password?token=${token}`,
                { newPassword }
            );

            toast.success(response.data.message);

            // Tambahkan jeda 3 detik sebelum pindah halaman
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal reset password.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className={styles.resetPasswordContainer}>
            <ToastContainer />
            <div className={styles.resetPasswordCard}>
                <h2>Setel Ulang Password</h2>
                <p>Masukkan password baru Anda.</p>
                <form onSubmit={handleResetPassword}>
                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            placeholder="Password Baru"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            placeholder="Konfirmasi Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className={styles.buttonSubmit}>
                        {loading ? "Memproses..." : "Setel Ulang Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
