import React from "react";

function AdminDashboard({ users, restaurants, orders }) {
  return (
    <section>
      <h3 className="admin-section-title">Dashboard Overview</h3>

      <div className="dashboard-cards">
        <div className="dash-card">
          <h4>Total Users</h4>
          <p>{users?.length}</p>
        </div>

        <div className="dash-card">
          <h4>Total Restaurants</h4>
          <p>{restaurants?.length}</p>
        </div>

        <div className="dash-card">
          <h4>Total Orders</h4>
          <p>{orders?.length}</p>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
