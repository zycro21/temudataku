import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../components/SidebarContext";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/userDashboard.css";
import Sidebar from "../components/SidebarAdmin";
import LogoSaja from "../assets/images/logosaja.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye, faEdit, faTrashAlt,
    faL
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from "../components/axiosInstance";

// Modal untuk menampilkan detail user
const UserDetailsModal = ({ userDetails, closeModal }) => {
    if (!userDetails) return null;

    return (
        <div className={`modal ${userDetails ? "open" : ""}`}>
            <div className="modal-content">
                <span className="modal-close" onClick={closeModal}>X</span>
                <h2>Detail User</h2>

                {userDetails ? (
                    <>
                        <img
                            src={userDetails.image ? `http://localhost:8000${userDetails.image}` : LogoSaja}
                            alt="User"
                            className="user-avatar-modal"
                        />
                        <p><strong>User ID:</strong> {userDetails.user_id}</p>
                        <p><strong>Email:</strong> {userDetails.email}</p>
                        <p><strong>Username:</strong> {userDetails.username}</p>
                        <p><strong>Created At:</strong> {new Date(userDetails.created_at).toLocaleDateString()}</p>
                    </>
                ) : (
                    <p className="error-message">User Details tidak ditemukan!</p>
                )}
            </div>
        </div>
    );
};

const UserDashboard = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState("default");

    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemPerPage = 10;

    // State untuk Modal Detail User
    const [userDetails, setUserDetails] = useState(null);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // State untuk modal update profil
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [updateUserData, setUpdateUserData] = useState({
        user_id: "",
        email: "",
        username: "",
        oldPassword: "",
        newPassword: "",
        role: "",
        name: "",
        expertise: "",
        bio: ""
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);


    const { isOpen } = useSidebar();

    // Fungsi Fetch Data API
    const fetchUsers = async (page = 1) => {
        try {
            const token = localStorage.getItem("token"); // atau dari sumber lain
            if (!token) {
                toast.error("Token tidak ditemukan!");
                return;
            }

            let url = `http://localhost:8000/api/users/getAllUsers?page=${page}&limit=10&search=${searchQuery}`;

            // Tambahkan filter role jika roleFilter bukan "default"
            if (roleFilter !== "default") {
                url += `&role=${roleFilter}`;
            }

            const response = await axiosInstance.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (response.status === 200) {
                setUsers(response.data.data);
                setAllUsers(response.data.data);
                setFilteredUsers(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setCurrentPage(response.data.pagination.currentPage);
            }
        } catch (error) {
            toast.error("Gagal memuat data user: " + error.message);
        }
    };

    useEffect(() => {
        setCurrentPage(1); // Reset ke halaman 1
        fetchUsers(1); // Fetch data untuk halaman 1
    }, [searchQuery, roleFilter]);

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchUsers(newPage);
        }
    }

    // Fungsi untuk Generate Pagination
    const generatePagination = () => {
        const pages = [];
        const maxVisiblePages = 4;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 2) {
                pages.push(1, 2, 3, 4, "...");
            } else if (currentPage >= totalPages - 1) {
                pages.push("...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...");
            }
        }

        return pages;
    };

    // Fungsi untuk mengambil detail user
    const handleDetailClick = async (userId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak dapat ditemukan!");
                return;
            }

            const response = await axiosInstance.get(`http://localhost:8000/api/users/getUser/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                setUserDetails(response.data.data);
                setIsModalDetailOpen(true);
            }
        } catch (error) {
            toast.error("Gagal mengambil data user: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = async (userId) => {

        let mentorData = { name: "", expertise: "", bio: "" };

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak dapat ditemukan!");
                return;
            }

            // Periksa apakah user_id ada di dalam user
            if (!userId) {
                console.error("user_id tidak ditemukan");
                return;
            }

            // Ambil data user berdasarkan user_id
            const userResponse = await axiosInstance.get(`http://localhost:8000/api/users/getUser/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            console.log(userResponse.data);

            if (userResponse.data.data.role === "mentor") {
                const mentorResponse = await axiosInstance.get(`http://localhost:8000/api/users/getMentorProfile/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                console.log(mentorResponse.data);

                mentorData = {
                    name: mentorResponse.data.name || "",
                    expertise: mentorResponse.data.expertise || "",
                    bio: mentorResponse.data.bio || ""
                };
            }

            setUpdateUserData({
                user_id: userId,
                email: userResponse.data.data.email || "",
                username: userResponse.data.data.username || "",
                oldPassword: "",
                newPassword: "",
                role: userResponse.data.data.role || "",
                name: mentorData.name || "",
                expertise: mentorData.expertise || "",
                bio: mentorData.bio || ""
            });

            setIsModalUpdateOpen(true);
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            toast.error("Terjadi kesalahan saat mengambil data.");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file); // Simpan file untuk dikirim ke API
            setPreviewImage(URL.createObjectURL(file)); // Buat preview sebelum diupload
        }
    };

    // Fungsi untuk mengupdate user
    const handleUpdateUser = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak dapat ditemukan!");
                return;
            }

            // Buat objek FormData untuk mengirim data
            const formData = new FormData();
            formData.append("email", updateUserData.email);
            formData.append("username", updateUserData.username);
            formData.append("oldPassword", updateUserData.oldPassword);
            formData.append("newPassword", updateUserData.newPassword);
            formData.append("role", updateUserData.role);

            // Jika user adalah mentor, tambahkan data mentor ke FormData
            if (updateUserData.role === "mentor") {
                formData.append("name", updateUserData.name);
                formData.append("expertise", updateUserData.expertise);
                formData.append("bio", updateUserData.bio);
            }

            // Tambahkan gambar jika ada gambar yang dipilih
            if (selectedImage) {
                formData.append("image", selectedImage);
            }

            // Kirim request update ke API
            const response = await axiosInstance.put(
                `http://localhost:8000/api/users/updateUser/${updateUserData.user_id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data", // Penting untuk upload file
                    },
                }
            );

            toast.success("Profil berhasil diperbarui!"); // Tampilkan notifikasi sukses

            // Perbarui UI dengan data terbaru
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.user_id === updateUserData.user_id ? { ...user, ...updateUserData } : user
                )
            );

            fetchUsers(currentPage);

            // Reset state gambar setelah update berhasil
            setSelectedImage(null);
            setPreviewImage(null);

            // Tutup modal setelah update berhasil
            setIsModalUpdateOpen(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data?.message || "Terjadi kesalahan, coba lagi nanti.");
        }
    };

    // Fungsi Delete User
    const handleDeleteUser = async (user_id) => {
        const result = await Swal.fire({
            title: "Anda yakin?",
            text: "Akun ini akan dihapus secara permanen dan tidak bisa dikembalikan lagi!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("token");
                const response = await axiosInstance.delete(`http://localhost:8000/api/users/deleteUser/${user_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    toast.success(response.data.message, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        draggable: true,
                        progress: undefined,
                    })
                }

                fetchUsers();
            } catch (err) {
                console.error("Error delete review: ", err);
                toast.error(
                    err.response?.data?.message ||
                    "Error Ketika Proses Menghapus Review.",
                    {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    }
                );
            }
        }
    }

    // Fungsi handle filter based on role
    const handleRoleFilter = () => {
        let newFilter;

        switch (roleFilter) {
            case "default":
                newFilter = "admin";
                break;
            case "admin":
                newFilter = "mentor";
                break;
            case "mentor":
                newFilter = "user";
                break;
            default:
                newFilter = "default";
                break;
        }

        setRoleFilter(newFilter);
        setCurrentPage(1); // Reset halaman ke 1 untuk memulai filter dari awal
        fetchUsers(1); // Panggil fetchUsers dengan roleFilter yang baru
    };

    return (
        <div className={`user-dashboard-container ${!isOpen ? "sidebar-closed" : ""}`}>
            <ToastContainer />
            <Sidebar />
            <div className="user-dashboard-header">
                <h1>Dashboard User</h1>
                <input type="text" placeholder="Search..." className="user-search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="user-dashboard-main">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>User ID</th>
                            <th>Email</th>
                            <th>Username</th>
                            <th onClick={handleRoleFilter} className="filterable">
                                Role {roleFilter !== "default" && `(${roleFilter})`}
                            </th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user, index) => (
                                <tr key={user.user_id}>
                                    <td>{(currentPage - 1) * itemPerPage + (index + 1)}</td>
                                    <td>{user.user_id}</td>
                                    <td>{user.email}</td>
                                    <td>{user.username}</td>
                                    <td className={`role ${user.role.toLowerCase()}`}>{user.role}</td>
                                    <td>
                                        <div className="action-container">
                                            <button
                                                className="action-button btn-detail"
                                                onClick={() => handleDetailClick(user.user_id)}
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <button
                                                className="action-button btn-edit"
                                                onClick={() => handleEditUser(user.user_id)}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                className="action-button btn-delete"
                                                onClick={() => handleDeleteUser(user.user_id)}
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data">
                                    Tidak ada data yang dapat ditampilkan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination page controls */}
                <div className="user-pagination">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        &laquo;
                    </button>

                    {generatePagination().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === "number" && handlePageChange(page)}
                            className={page === currentPage ? "active" : ""}
                            disabled={page === "..."}>
                            {page}
                        </button>
                    ))}

                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        &raquo;
                    </button>
                </div>
            </div>

            {/* Modal untuk detail user */}
            {isModalDetailOpen && <UserDetailsModal userDetails={userDetails} closeModal={() => setIsModalDetailOpen(false)} />}

            {isModalUpdateOpen && (
                <div className="update-modal">
                    <div className="update-modal-content">
                        <h3>Edit Profil</h3>
                        <form onSubmit={handleUpdateUser}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={updateUserData.email}
                                onChange={(e) => setUpdateUserData({ ...updateUserData, email: e.target.value })}
                            />

                            <label>Username</label>
                            <input
                                type="text"
                                value={updateUserData.username}
                                onChange={(e) => setUpdateUserData({ ...updateUserData, username: e.target.value })}
                            />

                            <label>Password Lama</label>
                            <input
                                type="password"
                                value={updateUserData.oldPassword}
                                onChange={(e) => setUpdateUserData({ ...updateUserData, oldPassword: e.target.value })}
                                required
                            />

                            <label>Password Baru (Opsional)</label>
                            <input
                                type="password"
                                value={updateUserData.newPassword}
                                onChange={(e) => setUpdateUserData({ ...updateUserData, newPassword: e.target.value })}
                                placeholder="Hanya Masukkan Jika Ingin Mengupdate Password"
                            />

                            {/* Upload Gambar */}
                            <label>Gambar Profil</label>
                            {previewImage && <img src={previewImage} alt="Preview" className="profile-preview" />}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />

                            {/* Jika role adalah mentor, tampilkan tambahan input */}
                            {updateUserData.role === "mentor" && (
                                <>
                                    <label>Nama</label>
                                    <input
                                        type="text"
                                        value={updateUserData.name}
                                        onChange={(e) => setUpdateUserData({ ...updateUserData, name: e.target.value })}
                                    />

                                    <label>Keahlian</label>
                                    <input
                                        type="text"
                                        value={updateUserData.expertise}
                                        onChange={(e) => setUpdateUserData({ ...updateUserData, expertise: e.target.value })}
                                    />

                                    <label>Bio</label>
                                    <textarea
                                        value={updateUserData.bio}
                                        onChange={(e) => setUpdateUserData({ ...updateUserData, bio: e.target.value })}
                                    />
                                </>
                            )}

                            <div className="update-modal-buttons">
                                <button type="submit">Simpan</button>
                                <button type="button" onClick={() => setIsModalUpdateOpen(false)}>Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserDashboard;