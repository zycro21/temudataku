import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import axiosInstanceUser from "./axiosInstanceUser";

// Buat context
const OrderContext = createContext();

// Provider untuk membungkus aplikasi
export const OrderProvider = ({ children }) => {
    const [orderCount, setOrderCount] = useState(0);

    // Fetch orders dari API saat komponen pertama kali dipasang
    useEffect(() => {
        const fetchUserOrders = async () => {
            try {
                const token = localStorage.getItem("token"); // Ambil token dari localStorage
                if (!token) return; // Jika tidak ada token, hentikan eksekusi

                const response = await axiosInstanceUser.get("/api/orders/getOrderByUser", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const orders = response.data.data;

                // Hitung jumlah order yang berstatus "pending" atau "cancelled"
                const filteredOrders = orders.filter(order =>
                    ["pending", "cancelled"].includes(order.status)
                );

                setOrderCount(filteredOrders.length);
            } catch (error) {
                console.error("Gagal mengambil order:", error);
            }
        };

        fetchUserOrders();
    }, []);

    return (
        <OrderContext.Provider value={{ orderCount, setOrderCount }}>
            {children}
        </OrderContext.Provider>
    );
};

// Hook untuk menggunakan orderCount di mana saja
export const useOrder = () => {
    return useContext(OrderContext);
};
