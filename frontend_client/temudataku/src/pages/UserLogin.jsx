import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavbarMainPage from "../components/NavbarMainPage";
import FooterMainPage from "../components/FooterMainPage";
import "../assets/styles/userLogin.css";

const LogoLogin = require("../assets/images/TemuDataku-07.png");

const UserLogin = () => {
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:8000/api/users/login", {
                emailOrUsername,
                password,
            });

            const { user, token } = response.data;

            // Cek apakah role adalah admin
            if (user.role === "admin") {
                toast.error("Akun admin tidak dapat login di sini.");
                setLoading(false);
                return;
            }

            // Simpan token dan user ke localStorage hanya jika bukan admin
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

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
        <>
            <div className="user-login-container">
                <ToastContainer />

                <div className="user-login-card">
                    <div className="user-login-left">
                        <img src={LogoLogin} alt="TemuDataku Logo" className="logo-image" />
                        {/* <h1 className="logo">TemuDataku</h1> */}
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
                                    <input type="checkbox" /> Ingat saya
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
        </>
    );
};

export default UserLogin;
