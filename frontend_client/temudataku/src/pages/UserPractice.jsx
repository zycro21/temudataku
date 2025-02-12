import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import NavbarMainPage from "../components/NavbarMainPage";
import FooterMainPage from "../components/FooterMainPage";
import "../assets/styles/userPractice.css";

const UserPractice = () => {
    return (
        <>
            <ToastContainer />
            <NavbarMainPage />

            

            <FooterMainPage />
        </>
    )
}

export default UserPractice;