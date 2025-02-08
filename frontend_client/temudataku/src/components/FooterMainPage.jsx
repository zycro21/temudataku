import React from "react";
import { FaInstagram, FaLinkedin, FaPhone, FaEnvelope } from "react-icons/fa";
import LogoPutih from "../assets/images/logoputih.png";
import "../assets/styles/footerMainPage.css";

const FooterMainPage = () => {
    return (
        <>
            <footer className="footer">
                <div className="footer-container">
                    {/* Logo dan Terms */}
                    <div className="footer-section">
                        <img src={LogoPutih} alt="Temu Dataku Logo" className="footer-logo" />
                        <p className="footer-text">
                            Be sure to take a look at our
                        </p>
                        <p className="footer-links">
                            <a href="#" className="footer-link">
                                Terms of Use
                            </a>{" "}
                            and{" "}
                            <a href="#" className="footer-link">
                                Privacy Policy
                            </a>
                        </p>
                    </div>

                    {/* About Section */}
                    <div className="footer-section">
                        <h3>About</h3>
                        <ul>
                            <li><a href="#">Tentang Kami</a></li>
                            <li><a href="#">Mentoring Data Science</a></li>
                            <li><a href="#">Practice Data Science</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>

                    {/* Social Media & Contact */}
                    <div className="footer-section">
                        <h3>Social Media</h3>
                        <div className="footer-icons">
                            <a href="#" className="icon"><FaInstagram /></a>
                            <a href="#" className="icon"><FaLinkedin /></a>
                        </div>

                        <h3>Contact</h3>
                        <div className="footer-icons">
                            <a href="#" className="icon"><FaPhone /></a>
                            <a href="#" className="icon"><FaEnvelope /></a>
                        </div>
                        <p className="footer-address">
                            Kelurahan Karangbesuki, Kecamatan Sukun, Kota Malang
                        </p>
                    </div>
                </div>

                {/* Copyright */}
                <div className="footer-copyright">
                    &copy; {new Date().getFullYear()} Temu Dataku. All rights reserved.
                </div>
            </footer>
        </>
    );
};


export default FooterMainPage;
