import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/AccountPage.css";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("orders");

 const orders = [
  {
    id: 1,
    restaurant: "Burger King",
    items: "Whopper Menu - Large Fries & Cola",
    total: 240,
    date: "26 Nov 2025 / 17:14",
    statusText: "delivered",       // delivered | preparing | on_the_way | pending  
  }
];


  return (
    <div className="account-container">
      
      <Header />

      <div className="account-page-wrapper">
        {/* Sidebar */}
        <aside className="account-sidebar">
          <h3 className="sidebar-title">My Account</h3>
          <p className="sidebar-username">Username</p>

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
            <button
              className={activeTab === "cards" ? "active" : ""}
              onClick={() => setActiveTab("cards")}
            >
              <i className="fa-solid fa-credit-card"></i>
              <span className="side-btn">Saved Cards</span>
            </button>
            <button className="logout-btn"> 
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
              <span className="side-btn">Logout</span>
            </button>
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="account-content">

          {/* ORDER HISTORY */}
          {activeTab === "orders" && (
            <section>
              <h2 className="section-title">My Orders</h2>

              {orders.map((order) => (
                <div key={order.id} className="order-card">

                  {/* LEFT SIDE */}
                  <div className="order-card-left">
                    <p className="order-restaurant">{order.restaurant}</p>

                    <div className="order-status-line">
                      <i
                        className={`fa-solid status-icon ${
                          order.status === "delivered"
                            ? "fa-circle-check delivered"
                            : order.status === "preparing"
                            ? "fa-fire preparing"
                            : order.status === "on_the_way"
                            ? "fa-truck-fast on-the-way"
                            : "fa-clock pending"
                        }`}
                      ></i>
                      <span
                        className={`status-badge ${
                          order.status === "delivered"
                            ? "delivered"
                            : order.status === "preparing"
                            ? "preparing"
                            : order.status === "on_the_way"
                            ? "on-the-way"
                            : "pending"
                        }`}
                      >
                        {order.statusText}
                      </span>
                    </div>

                    <p className="order-items">{order.items}</p>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="order-card-right">
                    <p className="order-date">{order.date}</p>
                    <p className="order-price">{order.total}₺</p>
                  </div>

                </div>
              ))}

            </section>

          )}

          {/* ACCOUNT DETAILS */}
          <div className="account-content-inner">
            {activeTab === "details" && (
              <section className="account-details">
                <h2 className="details-header">Account Details</h2>
                <form className="details-form">

                  {/* Name & Surname */}
                  <div className="row">
                    <div className="field">
                      <label htmlFor="firstName">Name</label>
                      <input id="firstName" type="text" />
                    </div>

                    <div className="field">
                      <label htmlFor="lastName">Surname</label>
                      <input id="lastName" type="text" />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="field full">
                    <label htmlFor="email">E-Mail</label>
                    <input id="email" type="email" />
                  </div>

                  {/* Info */}
                  <p className="info">
                    After updating your email, you will be automatically logged out.
                    You must log in again with your new email.
                  </p>

                  {/* Update Button */}
                  <button type="submit" className="update-btn">Update</button>
                </form>
              </section>
            )}
          </div>

  


        </main>
      </div>

      <Footer />


    </div>
  );
}