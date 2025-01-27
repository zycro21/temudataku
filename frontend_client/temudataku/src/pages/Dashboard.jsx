import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/dashboard.css";
import Sidebar from "../components/SidebarAdmin";

const Dashboard = () => {
    return (
        <div className="admin-dashboard-page">
            <ToastContainer />
            <Sidebar />
            <div className="dashboard-main-content">
                <div className="header-main-content">

                </div>
                <div className="main-content-1">

                </div>
                <div className="main-content-table">

                </div>
            </div>
        </div>
    )
}

export default Dashboard;