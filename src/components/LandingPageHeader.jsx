import React from "react";
import "../styles/landing.css";



function LandingPageHeader(){

    return(
        <nav>
            <p id="logo"><span>Deli</span>go</p>
            <ul className="links">
                <li className="nav-link"><a href="">Home</a></li>
                <li className="nav-link"><a href="">About Us</a></li>
                <li className="nav-link"><a href="">Contact</a></li>
            </ul>

            <a className="sign-in-btn" href="">Sign In</a>
        </nav>
        
    )
}

export default LandingPageHeader;