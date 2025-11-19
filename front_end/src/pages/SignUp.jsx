import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css"


function SignUp(){

    const [active, setActive] = useState(false);
    const navigate = useNavigate();



    return(

        <div id="signup-page-wrapper">
            <div className = {`container ${active ? "right-panel-active" : ""}`}
            id="container">
                <div className="form-container sign-up-container">
                    <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        navigate("/home");
                    }}
                    >
                        <h1 className="crt-acc-text">Create Account</h1>
                        <div className="social-container">
                            <a href="#" className="social"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" className="social"><i class="fab fa-google-plus-g"></i></a>
                            <a href="#" className="social"><i class="fab fa-linkedin-in"></i></a>
                        </div>
                        <span className="sign-up-span">or use your email for registration</span>
                        <input type="text" placeholder="Name" />
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Password" />
                        <button className="btn">Sign Up</button>
                    </form>
                </div>
                <div className="form-container sign-in-container">
                    <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        navigate("/home");
                    }}
                    >
                        <h1 className="crt-acc-text">Sign in</h1>
                        <div className="social-container">
                            <a href="#" className="social"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" className="social"><i class="fab fa-google-plus-g"></i></a>
                            <a href="#" className="social"><i class="fab fa-linkedin-in"></i></a>
                        </div>
                        <span className="sign-up-span">or use your account</span>
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Password" />
                        <a href="#" className="sign-up-a">Forgot your password?</a>
                        <button className="btn">Sign In</button>
                    </form>
                </div>
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1 className="crt-acc-text">Welcome Back!</h1>
                            <p className="sign-up-p">To keep connected with us please login with your personal info</p>
                            <button className="ghost btn" onClick={() => setActive(false)} id="signIn">Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1 className="crt-acc-text">Hello, Friend!</h1>
                            <p className="sign-up-p">Enter your personal details and start journey with us</p>
                            <button className="ghost btn" onClick={() => setActive(true)} id="signUp">Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
       

       
    )
}

export default SignUp;