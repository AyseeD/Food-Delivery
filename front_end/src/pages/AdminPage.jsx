import React, { useState } from "react";
import "../styles/AdminPage.css";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminUsers from "../components/admin/AdminUsers";
import AdminRestaurants from "../components/admin/AdminRestaurants";
import AdminOrders from "../components/admin/AdminOrders";

function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="admin-page">
      {/* TOPBAR */}
      <div className="admin-topbar">
        <button className="admin-logout-btn" onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";}} >
          Logout
        </button>
      </div>

      <div className="admin-layout">

        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <h2 className="admin-title">Admin Menu</h2>
          <nav className="admin-nav">
            <button onClick={() => setActiveTab("dashboard")} className={activeTab === "dashboard" ? "active" : ""}>Dashboard</button>
            <button onClick={() => setActiveTab("users")} className={activeTab === "users" ? "active" : ""}>Users</button>
            <button onClick={() => setActiveTab("restaurants")} className={activeTab === "restaurants" ? "active" : ""}>Restaurants</button>
            <button onClick={() => setActiveTab("orders")} className={activeTab === "orders" ? "active" : ""}>Orders</button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="admin-main">
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "restaurants" && <AdminRestaurants />}
          {activeTab === "orders" && <AdminOrders />}
        </main>

      </div>
    </div>
  );
}

export default AdminPage;
