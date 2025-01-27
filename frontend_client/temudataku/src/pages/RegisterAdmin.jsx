import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/registerAdmin.css";

const Register = () => {
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
    });

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmitRegister = async (e) => {
        e.preventDefault();

        try {
            await axios.post("http://localhost:8000/api/users/register", {
                ...formData,
                role: "admin",
            });

            toast.success("Berhasil Melakukan Pendaftaran! Mengarahkan ke Halaman Login...", {
                position: "top-right",
                autoClose: 5000,
            });
            setTimeout(() => {
                navigate("/loginAdmin");
            }, 2000);
        } catch (err) {
            if (err.response && err.response.data.errors) {
                err.response.data.errors.forEach((error) => toast.error(error.msg, {
                    position: "top-right",
                }));
            } else {
                toast.error("Terjadi kesalahan saat mendaftar", {
                    position: "top-right",
                });
            }
        }
    };

    return (
        <div className="admin-register-page">
            <ToastContainer />
            <div className="admin-title-form">
                <p>Admin Register</p>
            </div>
            <div className="admin-register-form-container">
                <form onSubmit={handleSubmitRegister} className="admin-main-form">
                    <input
                        type="email"
                        name="email"
                        placeholder="E-mail"
                        value={formData.email}
                        onChange={handleInputChange}
                        autoComplete="off"
                        required
                    />
                    <input
                        type="text" 
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleInputChange}
                        autoComplete="off"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        autoComplete="off"
                        required
                    />
                    <button type="submit" className="admin-register-button">Register</button>
                </form>
            </div>
            <p>Sudah memiliki akun? <Link to="/loginAdmin">Login Di sini</Link></p>
        </div>
    )
}

export default Register;