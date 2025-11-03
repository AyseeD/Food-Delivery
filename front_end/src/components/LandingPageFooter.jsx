import React from "react";
import "../styles/landing.css";


function LandingPageFooter(){
    return(
        <footer className="footer">

            <div className="container">
                <div className="row">
                    
                    <div className="footer-col">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#">About us</a></li>
                            <li><a href="#">Our services</a></li>
                            <li><a href="#">Privacy policy</a></li>
                            <li><a href="#">Affiliate program</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Get help</h4>
                        <ul>
                            <li><a href="#">FAQ</a></li>
                            <li><a href="#">Shipping</a></li>
                            <li><a href="#">Returns</a></li>
                            <li><a href="#">Order status</a></li>
                            <li><a href="#">Payment options</a></li>
                        </ul>
                    </div>

                </div>
            </div>

        </footer>
    )
}

export default LandingPageFooter;