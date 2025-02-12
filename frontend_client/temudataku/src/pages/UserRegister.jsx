import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/userRegister.css";

const UserRegister = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:8000/api/users/register", {
                email,
                username,
                password,
                role: "user", // Set otomatis sebagai "user"
            });

            toast.success("Pendaftaran Berhasil! Silakan Login.", {
                position: "top-right",
            });

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Pendaftaran Gagal", {
                position: "top-right",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="user-register-container">
                <div className="user-register-card">
                    <div className="user-register-left">
                        <div className="logo-container">
                            <img src="/assets/images/logo-temudataku.png" alt="TemuDataku Logo" className="logo-image" />
                            <h1 className="logo">TemuDataku</h1>
                        </div>
                    </div>

                    <div className="user-register-right">
                        <h2>Sign Up</h2>
                        <form onSubmit={handleRegister}>
                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
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
                            <button type="submit" disabled={loading}>
                                {loading ? "Memproses..." : "Daftar"}
                            </button>
                        </form>
                        <p>
                            Sudah punya akun? <Link to="/login">Login</Link>
                        </p>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </>
    );
};

export default UserRegister;
