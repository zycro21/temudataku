import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../components/SidebarContext";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/orderDashboard.css";
import Sidebar from "../components/SidebarAdmin";
import LogoSaja from "../assets/images/logosaja.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye, faEdit, faTrashAlt,
    faL
} from '@fortawesome/free-solid-svg-icons';

const OrderDashboard = () => {
    return (
        <>
            <div className="order-dashboard-container">
                <ToastContainer />
                <Sidebar />

                {/* Header Dashboard */}
                <div className="user-dashboard-header">
                    <h1>Dashboard Order</h1>

                    {/* Search Bar */}
                    <input
                        type="text"
                        placeholder="Search..."
                        className="user-search-input"
                    // value={search}
                    // onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="user-dashboard-main">
                    <div className="user-table">
                        
                    </div>
                </div>
            </div>

        </>
    )
}

export default OrderDashboard;