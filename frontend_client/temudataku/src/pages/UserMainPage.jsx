import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "../assets/styles/userMainPage.css";
import NavbarMainPage from "../components/NavbarMainPage";
import FooterMainPage from "../components/FooterMainPage";

const UserMainPage = () => {
    return (
        <>
            <div className="mainpage-user">
                <ToastContainer />
                <NavbarMainPage />

                <FooterMainPage />
            </div>
        </>
    )
}

export default UserMainPage;