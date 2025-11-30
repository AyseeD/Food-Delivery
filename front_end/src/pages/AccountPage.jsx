import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/AccountPage.css";
import OrderCard from "../components/OrderCard";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("orders");

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch logged-in user info
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
      } catch (err) {
        console.error("Failed to load user info", err);
      }

      setLoadingUser(false);
    }

    loadUser();
  }, [token]);

  // Fetch user orders
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
            <section className="account-details">
              <h2 className="details-header">Account Details</h2>

              {loadingUser ? (
                <p>Loading...</p>
              ) : (
                <form className="details-form">
                  <div className="row">
                    <div className="field">
                      <label>Name</label>
                      <input
                        type="text"
                        defaultValue={user?.full_name}
                      />
                    </div>
                  </div>

                  <div className="field full">
                    <label>Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                    />
                  </div>

                  <button className="update-btn">Update</button>
                </form>
              )}
            </section>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
