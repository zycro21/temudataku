import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import NavbarMainPage from "../components/NavbarMainPage";
import FooterMainPage from "../components/FooterMainPage";
import axiosInstanceUser from "../components/axiosInstanceUser";
import style from "../assets/styles/userInfo.module.css";

const Logo = require("../assets/images/logotemudataku.png");

const UserInfo = () => {
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // State untuk update modal
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();

    const fetchUserProfile = async () => {
        try {
            const storedUser = localStorage.getItem("user");
            const token = localStorage.getItem("token");

            // Jika token atau user tidak ada, redirect ke login
            if (!storedUser || !token) {
                navigate("/"); // Redirect ke halaman utama atau login
                return;
            }

            const parsedUser = JSON.parse(storedUser);
            const { user_id, role } = parsedUser;

            let response;
            if (role === "mentor") {
                response = await axiosInstanceUser.get(`/api/users/getMentorProfile/${user_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                response = await axiosInstanceUser.get(`/api/users/getUser/${user_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            setUserData(response.data.data || response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Gagal mengambil data profil.");
        } finally {
            setLoading(false);
        }
    };

    // Panggil fungsi saat komponen dimuat
    useEffect(() => {
        fetchUserProfile();
    }, []);

    return (
        <>
            <NavbarMainPage />
            <div className={style.userInfoContainer}>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className={style.error}>{error}</p>
                ) : userData ? (
                    <div className={style.profileCard}>
                        <img
                            src={userData.image ? `http://localhost:8000${userData.image}` : Logo}
                            alt="Profile"
                            className={style.profileImage}
                        />
                        <h2>{userData.username || userData.name}</h2>
                        <p>Email: {userData.email}</p>

                        {userData.role === "mentor" && (
                            <>
                                <p>Nama: {userData.name}</p>
                                <p>Bidang Keahlian: {userData.expertise}</p>
                                <p>Bio: {userData.bio}</p>
                            </>
                        )}

                        <button className={style.updateButton} onClick={() => setShowModal(true)}>
                            Edit Profil
                        </button>
                    </div>
                ) : (
                    <p>Data tidak ditemukan.</p>
                )}
            </div>

            <FooterMainPage />

            {/* Modal Update Profil */}
            {showModal && (
                <UpdateProfileModal
                    userData={userData}
                    onClose={() => setShowModal?.(false)}
                    refreshUserProfile={fetchUserProfile}
                />
            )}
        </>
    );
};

const UpdateProfileModal = ({ userData, onClose, refreshUserProfile }) => {
    const [formData, setFormData] = useState({
        email: userData.email || "",
        username: userData.username || "",
        oldPassword: "",
        newPassword: "",
        name: userData.name || "",
        expertise: userData.expertise || "",
        bio: userData.bio || "",
        image: null, // Tambahkan state untuk gambar
    });

    const [previewImage, setPreviewImage] = useState(""); // Untuk preview
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreviewImage(URL.createObjectURL(file)); // Menampilkan preview gambar
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.append("email", formData.email);
        formDataToSend.append("username", formData.username);
        formDataToSend.append("oldPassword", formData.oldPassword);
        if (formData.newPassword) formDataToSend.append("newPassword", formData.newPassword);
        if (formData.image) formDataToSend.append("image", formData.image); // Tambah gambar

        if (userData.role === "mentor") {
            formDataToSend.append("name", formData.name);
            formDataToSend.append("expertise", formData.expertise);
            formDataToSend.append("bio", formData.bio);
        }

        const toastId = "update-profile-toast";

        try {
            const response = await axiosInstanceUser.put(
                `api/users/updateUser/${userData.user_id}`,
                formDataToSend,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );

            if (!toast.isActive(toastId)) { // Cek jika belum ada toast dengan ID ini
                toast.success(response.data.message, { toastId });
            }

            await refreshUserProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal memperbarui profil.", { toastId });
        } finally {
            setLoading(false);
            setTimeout(() => {
                onClose();
            }, 500);
        }
    };

    return (
        <div className={style.modalOverlay}>
            <div className={style.modalContent}>
                <h2>Edit Profil</h2>
                <form onSubmit={handleSubmit}>
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />

                    <label>Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} />

                    <label>Password Lama (Wajib Diisi)</label>
                    <input type="password" name="oldPassword" value={formData.oldPassword} onChange={handleChange} required />

                    <label>Password Baru (Opsional)</label>
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Isi jika ingin mengubah password" />

                    {userData.role === "mentor" && (
                        <>
                            <label>Nama</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} />

                            <label>Bidang Keahlian</label>
                            <input type="text" name="expertise" value={formData.expertise} onChange={handleChange} />

                            <label>Bio</label>
                            <textarea name="bio" value={formData.bio} onChange={handleChange} />
                        </>
                    )}

                    {/* Input Upload Gambar */}
                    <label>Foto Profil</label>
                    {previewImage && <img src={previewImage} alt="Preview" className={style.previewImage} />}
                    <input type="file" name="image" accept="image/*" onChange={handleImageChange} />

                    <div className={style.modalActions}>
                        <button type="submit" className={style.updateButton} disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan"}
                        </button>
                        <button type="button" className={style.cancelButton} onClick={onClose}>
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserInfo;
