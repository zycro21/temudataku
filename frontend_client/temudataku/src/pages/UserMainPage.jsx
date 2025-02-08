import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "../assets/styles/userMainPage.css";
import NavbarMainPage from "../components/NavbarMainPage";

const UserMainPage = () => {
    return (
        <>
            <div className="mainpage-user">
                <ToastContainer />
                <NavbarMainPage />
            </div>
        </>
    )
}

export default UserMainPage;