import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
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
                            src={userDetails.image || LogoSaja}
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

const UpdateUserModal = ({ user, closeModal, onSave }) => {
    const [email, setEmail] = useState();
}

const UserDashboard = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState("default");

    // Hook untuk Modal Detail User
    const [userDetails, setUserDetails] = useState(null);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fungsi Fetch Data API
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token"); // atau dari sumber lain
            if (!token) {
                toast.error("Token tidak ditemukan!");
                return;
            }
            const response = await axios.get("http://localhost:8000/api/users/getAllUsers", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (response.status === 200) {
                setUsers(response.data.data);
                setFilteredUsers(response.data.data);
            }
        } catch (error) {
            toast.error("Gagal memuat data user: " + error.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Fungsi untuk mengambil detail user
    const handleDetailClick = async (userId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token tidak dapat ditemukan!");
                return;
            }

            const response = await axios.get(`http://localhost:8000/api/users/getUser/${userId}`, {
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
                const response = await axios.delete(`http://localhost:8000/api/users/deleteUser/${user_id}`, {
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
                setFilteredUsers(users.filter((user) => user.role === "admin"));
                break;
            case "admin":
                newFilter = "mentor";
                setFilteredUsers(users.filter((user) => user.role === "mentor"));
                break;
            case "mentor": // Perbaikan ada di sini
                newFilter = "user";
                setFilteredUsers(users.filter((user) => user.role === "user"));
                break;
            default: // Ketika roleFilter adalah "user", kembali ke default
                newFilter = "default";
                setFilteredUsers(users);
                break;
        }
        setRoleFilter(newFilter);
    };

    // Fungsi handle filter data based on search
    const displayedUsers = filteredUsers.filter(
        (user) =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="user-dashboard-container">
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
                        {displayedUsers.length > 0 ? (
                            displayedUsers.map((user, index) => (
                                <tr key={user.user_id}>
                                    <td>{index + 1}</td>
                                    <td>{user.user_id}</td>
                                    <td>{user.email}</td>
                                    <td>{user.username}</td>
                                    <td className={`role ${user.role.toLowerCase()}`}>{user.role}</td>
                                    <td>
                                        <button
                                            className="action-button btn-detail"
                                            onClick={() => handleDetailClick(user.user_id)}
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        <button
                                            className="action-button btn-edit"
                                            onClick={() => toast.warn("Fitur Edit belum diimplementasikan")}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            className="action-button btn-delete"
                                            onClick={() => handleDeleteUser(user.user_id)}
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
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
            </div>

            {/* Modal untuk detail user */}
            {isModalDetailOpen && <UserDetailsModal userDetails={userDetails} closeModal={() => setIsModalDetailOpen(false)} />}
        </div>
    )
}

export default UserDashboard;