import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";

function SignUp() {
  const navigate = useNavigate();

  const [rightPanelActive, setRightPanelActive] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    address: "", 
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e) {
    e.preventDefault();

    // Basic validation
    if (!form.full_name || !form.email || !form.password) {
      alert("Please fill in all required fields");
      return;
    }

    const res = await fetch("http://localhost:4000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      navigate("/home");
    } else {
      alert(data.error || "Failed to register");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      navigate("/home");
    } else {
      if (data.error && data.error.includes("deactivated")) {
        alert("Account Deactivated: " + data.error);
      } else {
        alert(data.error || "Login failed");
      }
    }
  }

  return (
    <div id="signup-page-wrapper">
      <div className={`container ${rightPanelActive ? "right-panel-active" : ""}`}>

        {/* SIGN UP */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegister}>
            <h1>Create Account</h1>
            <input 
              name="full_name" 
              type="text" 
              placeholder="Full Name *" 
              onChange={handleChange} 
              required 
            />
            <input 
              name="email" 
              type="email" 
              placeholder="Email *" 
              onChange={handleChange} 
              required 
            />
            <input 
              name="password" 
              type="password" 
              placeholder="Password *" 
              onChange={handleChange} 
              required 
            />
            <input 
              name="address" 
              type="text" 
              placeholder="Delivery Address (Street, City, ZIP)" 
              onChange={handleChange} 
            />
            <small className="field-note">* Required fields</small>
            <button className="btn">Sign Up</button>
          </form>
        </div>

        {/* SIGN IN */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h1>Sign in</h1>
            <input 
              name="email" 
              type="email" 
              placeholder="Email" 
              onChange={handleChange} 
              required 
            />
            <input 
              name="password" 
              type="password" 
              placeholder="Password" 
              onChange={handleChange} 
              required 
            />
            <a href="/admin/login">Sign In as Admin</a>
            <button className="btn">Sign In</button>
          </form>
        </div>

        {/* OVERLAY SECTION */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>If you already have an account, login here</p>
              <button className="btn ghost" onClick={() => setRightPanelActive(false)}>
                Sign In
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1>Hello Friend!</h1>
              <p>Enter your details to create an account</p>
              <button className="btn ghost" onClick={() => setRightPanelActive(true)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SignUp;