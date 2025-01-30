import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/"; // Sesuaikan dengan URL backend kamu

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menangani token expired
axiosInstance.interceptors.response.use(
  (response) => response, // Jika response sukses, langsung dikembalikan
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hapus token dari localStorage
      localStorage.removeItem("token");

      // Redirect ke halaman login
      window.location.href = "/loginAdmin"; // Mengarahkan user ke halaman login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;