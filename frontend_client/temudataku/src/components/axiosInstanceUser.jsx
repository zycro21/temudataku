import axios from "axios";

const axiosInstanceUser = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/",
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor untuk menangani token yang habis
axiosInstanceUser.interceptors.response.use(
    (response) => response, // Jika response sukses, langsung dikembalikan
    (error) => {
        if (error.response?.status === 401) {
            // Hapus token dari localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Redirect ke halaman utama
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default axiosInstanceUser;
