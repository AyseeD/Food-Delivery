import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/AccountPage.css";
import "../styles/OrderCard.css";
import OrderCard from "../components/OrderCard";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("orders");

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true); //for loading user info
  const [loadingOrders, setLoadingOrders] = useState(true); //for loading order info
  const [editMode, setEditMode] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  const [passwordForm, setPasswordForm] = useState({ //password form state
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const token = localStorage.getItem("token");

  //fetch logged in user info
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("http://localhost:4000/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setUser(data);
        setUpdatedUser({
          full_name: data.full_name,
          email: data.email,
          address: data.address || ""
        });
      } catch (err) {
        console.error("Failed to load user info", err);
      }

      setLoadingUser(false);
    }

    loadUser();
  }, [token]);

  //fetch user orders
  useEffect(() => {
    if (!user) return;

    async function loadOrders() {
      try {
        const res = await fetch(
          `http://localhost:4000/orders/user/${user.user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders", err);
      }

      setLoadingOrders(false);
    }

    loadOrders();
  }, [user, token]);

  //update user info
  const handleUpdateUser = async () => {
    try {
      const res = await fetch("http://localhost:4000/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setEditMode(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile: " + data.error);
      }
    } catch (err) {
      console.error("Failed to update user:", err);
      alert("Failed to update profile");
    }
  };

  //update password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    //validation
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/auth/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess("Password updated successfully!");
        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_password: ""
        });
        //clear success message after 3 seconds
        setTimeout(() => {
          setPasswordSuccess("");
          setShowPasswordChange(false);
        }, 3000);
      } else {
        setPasswordError(data.error || "Failed to update password");
      }
    } catch (err) {
      console.error("Failed to update password:", err);
      setPasswordError("Failed to update password. Please try again.");
    }
  };

  return (
    <div className="account-container">
      <Header />

      <div className="account-page-wrapper">
        {/* SIDEBAR */}
        <aside className="account-sidebar">
          <h3 className="sidebar-title">My Account</h3>
          <p className="sidebar-username">
            {loadingUser ? "Loading..." : user?.full_name}
          </p>

          <nav className="account-nav">
            <button
              className={activeTab === "orders" ? "active" : ""}
              onClick={() => setActiveTab("orders")}
            >
              <i className="fa-solid fa-receipt"></i>
              <span className="side-btn">Orders</span>
            </button>

            <button
              className={activeTab === "details" ? "active" : ""}
              onClick={() => setActiveTab("details")}
            >
              <i className="fa-solid fa-user"></i>
              <span className="side-btn">Account Details</span>
            </button>

            <button className="logout-btn" onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              <span className="side-btn">Logout</span>
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="account-content">

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <section>
              <h2 className="section-title">My Orders</h2>

              {loadingOrders ? (
                <p>Loading orders...</p>
              ) : orders.length === 0 ? (
                <p>No orders yet.</p>
              ) : (
                orders.map((order) => (
                  <OrderCard key={order.order_id} order={order} token={token} />
                ))
              )}
            </section>
          )}

          {/* ACCOUNT DETAILS TAB */}
          {activeTab === "details" && (
            <section className="account-details-section">
              <div className="account-details-card">

                <h2 className="details-title">Account Details</h2>

                {loadingUser ? (
                  <p>Loading...</p>
                ) : (
                  <div className="details-content">
                    {/* Password Change Section */}
                    {showPasswordChange ? (
                      <div className="password-change-box">
                        <h3 className="box-title">Change Password</h3>
                        <form onSubmit={handlePasswordChange} className="modern-form">
                          {passwordError && (
                            <div className="error-box">{passwordError}</div>
                          )}
                          {passwordSuccess && (
                            <div className="success-box">{passwordSuccess}</div>
                          )}


                          <div className="floating-field">
                            <label>Current Password *</label>
                            <input
                              type="password"
                              value={passwordForm.current_password}
                              onChange={(e) => setPasswordForm({
                                ...passwordForm,
                                current_password: e.target.value
                              })}
                              required
                              placeholder="Enter your current password"
                            />
                          </div>

                          <div className="floating-field">
                            <label>New Password *</label>
                            <input
                              type="password"
                              value={passwordForm.new_password}
                              onChange={(e) => setPasswordForm({
                                ...passwordForm,
                                new_password: e.target.value
                              })}
                              required
                              placeholder="At least 6 characters"
                              minLength="6"
                            />
                          </div>

                          <div className="floating-field">
                            <label>Confirm New Password *</label>
                            <input
                              type="password"
                              value={passwordForm.confirm_password}
                              onChange={(e) => setPasswordForm({
                                ...passwordForm,
                                confirm_password: e.target.value
                              })}
                              required
                              placeholder="Confirm your new password"
                            />
                          </div>

                          <div className="form-buttons">
                            <button type="submit" className="btn-primary">
                              Update Password
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => {
                                setShowPasswordChange(false);
                                setPasswordError("");
                                setPasswordSuccess("");
                                setPasswordForm({
                                  current_password: "",
                                  new_password: "",
                                  confirm_password: ""
                                });
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : editMode ? (
                      <form className="modern-form">

                        <div className="floating-field">
                          <input
                            type="text"
                            id = "name"
                            value={updatedUser.full_name}
                            onChange={(e) => setUpdatedUser({
                              ...updatedUser,
                              full_name: e.target.value
                            })}
                            required
                          />
                          <label for= "name"> Full Name </label>

                        </div>

                        <div className="floating-field">
                          <input
                            type="email"
                            value={updatedUser.email}
                            onChange={(e) => setUpdatedUser({
                              ...updatedUser,
                              email: e.target.value
                            })}
                            required
                          />
                          <label for = "email" >Email </label>
                        </div>

                        <div className="floating-field">
                          <label>Delivery Address</label>
                          <textarea
                            value={updatedUser.address || ""}
                            onChange={(e) => setUpdatedUser({
                              ...updatedUser,
                              address: e.target.value
                            })}
                            placeholder="Enter your delivery address"
                            rows="3"
                          />
                          <small>Street, City, ZIP Code</small>
                        </div>

                        <div className="form-buttons">
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={handleUpdateUser}
                          >
                            Save Changes
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setEditMode(false);
                              setUpdatedUser({
                                full_name: user.full_name,
                                email: user.email,
                                address: user.address || ""
                              });
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* VIEW MODE */

                      <div className="user-info-grid">
                        <div className="info-card">
                          <p>Name: <span>{user.full_name}</span></p>
                        </div>
                        <div className="info-card">
                          <p>Email: <span>{user.email}</span></p>
                        </div>
                        <div className="info-card">
                          <p>Address: <span>{user.address || "Not provided"}</span></p>
                        </div>
                        <div className="info-card">
                          <p>Account Created: <span>{new Date(user.created_at).toLocaleDateString()}</span></p>
                        </div>


                        <div className="action-buttons">
                          <button
                            className="btn-primary"
                            onClick={() => setEditMode(true)}
                          >
                            Edit Profile
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => setShowPasswordChange(true)}
                          >
                            Change Password
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      
    </div>
  );
}