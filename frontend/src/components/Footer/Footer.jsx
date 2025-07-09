import React from 'react';
import "./Footer.css";
import { FaSquareFacebook } from "react-icons/fa6";
import { FaSquareInstagram } from "react-icons/fa6";
import { FaTwitterSquare } from "react-icons/fa";

const Footer = ()=>{
    return(
       <footer className='footer'>
        <div className='footer-content'>
            <p>
                &copy; 2024 Your E-Learning Platform. All rights reserved. <br/>
                Made with ❤️ <a href="">Rohit Kumar Singh</a>
            </p>
            <div className="social-links">
                <a href="#"><FaSquareFacebook /></a>
                <a href="#"><FaSquareInstagram /></a>
                <a href="#"><FaTwitterSquare /></a>
            </div>
        </div>
       </footer>
    )
}

export default Footer;