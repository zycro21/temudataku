import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import styles from "../assets/styles/requestResetPassword.module.css";

const RequestResetPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRequestReset = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error("Harap masukkan email Anda!");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post("http://localhost:8000/api/users/request-reset-password", {
                email,
            });

            toast.success(response.data.message || "Link reset password telah dikirim ke email Anda.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Terjadi kesalahan, coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.requestResetContainer}>
            <ToastContainer />
            <div className={styles.requestResetCard}>
                <h2>Reset Password</h2>
                <p>Masukkan email Anda, kami akan mengirimkan link reset password.</p>
                <form onSubmit={handleRequestReset}>
                    <div className={styles.inputGroup}>
                        <input
                            type="email"
                            placeholder="Masukkan Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.buttonSubmit} disabled={loading}>
                        {loading ? "Mengirim..." : "Kirim Link Reset"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RequestResetPassword;
