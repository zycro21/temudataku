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
            <div className="orderdashboard-container">
                <ToastContainer />
                <Sidebar />

                <p>HALO</p>
            </div>
        </>
    )
}

export default OrderDashboard;