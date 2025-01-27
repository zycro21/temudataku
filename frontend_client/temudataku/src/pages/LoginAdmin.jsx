import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/loginAdmin.css";

const LoginAdmin = () => {
    const [formData, setFormData] = useState({
        emailOrUsername: "",
        password: ""
    });

    const navigate = useNavigate();

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    }

    // Handle Submit Login
    const handleSubmitLogin = async (e) => {
        e.preventDefault();
        const { emailOrUsername, password } = formData;

        try {
            const response = await axios.post("http://localhost:8000/api/users/login", {
                emailOrUsername,
                password,
            });

            if (response.status === 200) {
                // Simpan token ke localstorage
                localStorage.setItem("token", response.data.token);

                // Tampilkan pesan sukses
                toast.success("Login Berhasil");

                setTimeout(() => {
                    navigate("/dashboard");
                }, 2000);
            }
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data.message || "Terjadi Kesalahan");
            } else {
                toast.error("Tidak dapat menghubungi server");
            }
        }
    }

    return (
        <div className="admin-login-page">
            <ToastContainer />
            <div className="admin-title-form">
                <p>Admin Login</p>
            </div>
            <div className="admin-login-form-container">
                <form className="admin-main-form" onSubmit={handleSubmitLogin}>
                    <input
                        type="text"
                        name="emailOrUsername"
                        placeholder="E-mail or Username"
                        value={formData.emailOrUsername}
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
                    <button type="submit" className="admin-login-button">Login</button>
                </form>
            </div>
            <p>Belum memiliki akun? <Link to="/registerAdmin">Daftar Di sini</Link></p>
        </div>
    )
}

export default LoginAdmin;