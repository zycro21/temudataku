import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/userLogin.css";

const LogoLogin = require("../assets/images/TemuDataku-07.png");

const EXPIRATION_DAYS = 3; // Batas waktu dalam hari
const EXPIRATION_TIME = EXPIRATION_DAYS * 24 * 60 * 60 * 1000; // Konversi ke milidetik

const UserLogin = () => {
    const [emailOrUsername, setEmailOrUsername] = useState(localStorage.getItem("savedEmail") || "");
    const [password, setPassword] = useState(localStorage.getItem("savedPassword") || "");
    const [rememberMe, setRememberMe] = useState(!!localStorage.getItem("savedEmail"));
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Cek apakah sesi login masih berlaku atau sudah kadaluarsa
    useEffect(() => {
        const savedEmail = localStorage.getItem("savedEmail");
        const savedPassword = localStorage.getItem("savedPassword");
        const savedToken = localStorage.getItem("token");
        const savedTimestamp = localStorage.getItem("loginTimestamp");

        if (savedEmail && savedPassword && savedToken && savedTimestamp) {
            const now = Date.now();
            const timeDiff = now - parseInt(savedTimestamp, 10);

            if (timeDiff > EXPIRATION_TIME) {
                // Jika sudah kadaluarsa, hapus email & password agar user harus login ulang
                localStorage.removeItem("savedEmail");
                localStorage.removeItem("savedPassword");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("loginTimestamp");

                toast.info("Sesi Anda telah berakhir. Silakan login kembali.");
            }
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:8000/api/users/login", {
                emailOrUsername,
                password,
            });

            const { user, token } = response.data;

            if (user.role === "admin") {
                toast.error("Akun admin tidak dapat login di sini.");
                setLoading(false);
                return;
            }

            const now = Date.now();

            if (rememberMe) {
                localStorage.setItem("savedEmail", emailOrUsername);
                localStorage.setItem("savedPassword", password);
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("loginTimestamp", now);
            } else {
                // Hapus jika tidak mencentang "Ingat Saya"
                localStorage.removeItem("savedEmail");
                localStorage.removeItem("savedPassword");
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
            }

            toast.success("Login Berhasil!");
            setTimeout(() => {
                navigate("/");
            }, 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || "Terjadi kesalahan, coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-login-container">
            <ToastContainer />
            <div className="user-login-card">
                <div className="user-login-left">
                    <img src={LogoLogin} alt="TemuDataku Logo" className="logo-image" />
                </div>
                <div className="user-login-right">
                    <h2>Sign In</h2>
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Email atau Username"
                                value={emailOrUsername}
                                onChange={(e) => setEmailOrUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="login-options">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                />{" "}
                                Ingat saya
                            </label>
                            <Link to="/request-reset-password">Lupa password?</Link>
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? "Memproses..." : "Login"}
                        </button>
                    </form>
                    <p>
                        Belum punya akun? <Link to="/register">Daftar</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;