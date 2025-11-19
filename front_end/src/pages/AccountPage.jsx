import { useState } from "react";
import "../styles/AccountPage.css";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("orders");

  const orders = [
    {
      id: 1,
      restaurant: "Burger King",
      menu: "Whopper Menu - Large Fries & Cola",
      total: 240,
      status: "delivering",
      statusImage: "/images/status-delivering.png",
    }
  ];

  return (
    <div className="account-container">
      
      {/* Sidebar */}
      <aside className="account-sidebar">
        <h3 className="sidebar-title">My Account</h3>
        <p className="sidebar-username">Username</p>

        <nav className="account-nav">
          <button
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={activeTab === "details" ? "active" : ""}
            onClick={() => setActiveTab("details")}
          >
            Account Details
          </button>
          <button
            className={activeTab === "cards" ? "active" : ""}
            onClick={() => setActiveTab("cards")}
          >
            Saved Cards
          </button>
          <button className="logout-btn">Logout</button>
        </nav>
      </aside>

      {/* Content */}
      <main className="account-content">
        {activeTab === "orders" && (
          <section>
            <h2 className="section-title">My Orders</h2>

            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-info">
                  <p><strong>Restaurant:</strong> {order.restaurant}</p>
                  <p><strong>Order:</strong> {order.menu}</p>
                  <p><strong>Total:</strong> {order.total}₺</p>
                </div>

                <div className="order-status">
                  <img src={order.statusImage} alt="status" className="status-icon" />
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === "details" && (
          <section>
            <h2 className="section-title">Account Details</h2>
            <p>Name: John Doe</p>
            <p>Email: johndoe@mail.com</p>
            <p>Address: New York, USA</p>
          </section>
        )}

        {activeTab === "cards" && (
          <section>
            <h2 className="section-title">Saved Cards</h2>
            <p>No saved cards yet.</p>
          </section>
        )}
      </main>
    </div>
  );
}