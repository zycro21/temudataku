import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "../assets/styles/userMentoring.css";
import NavbarMainPage from "../components/NavbarMainPage";
import FooterMainPage from "../components/FooterMainPage";

const UserMentoring = () => {
    return (
        <>
            <ToastContainer />
            <NavbarMainPage />

            <div className="hero-section-mentoring">
                
            </div>

            <FooterMainPage />
        </>
    )
}

export default UserMentoring;