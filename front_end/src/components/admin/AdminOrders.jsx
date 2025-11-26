import React, { useEffect, useState } from "react";
import OrderStatusDropdown from "./OrderStatusDropdown";
import "../../styles/AdminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {

    setOrders([
      {
        id: 1,
        user: "Sena İdiz",
        restaurant: "Burger King",
        items: ["Whopper Menu - Large Fries & Cola"],
        total: 240,
        status: "preparing",
        date: "26 Nov 2025 – 17:14",
      },
      {
        id: 2,
        user: "Ali Demir",
        restaurant: "Dominos Pizza",
        items: ["Medium Mix Pizza"],
        total: 195,
        status: "delivering",
        date: "25 Nov 2025 – 20:51",
      },
    ]);
  }, []);

  const updateStatus = (orderId, newStatus) => {
  

    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <div className="admin-orders">

      <h2 className="orders-page-title">Orders</h2>

      <div className="orders-wrapper">
        {orders.map(order => (
          <div key={order.id} className="order-card">

            <div className="order-header">
              <span className="restaurant-name">{order.restaurant}</span>
            </div>

            <div className="order-body">
              <p><strong>User:</strong> {order.user}</p>
              <p><strong>Date:</strong> {order.date}</p>

              <ul className="order-items">
                {order.items.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="order-footer">
              <div className="order-status-badge">
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-actions">
                <span className="order-price">{order.total}₺</span>
                <OrderStatusDropdown
                  currentStatus={order.status}
                  onChange={(newStatus) => updateStatus(order.id, newStatus)}
                />
              </div>
            </div>




          </div>
        ))}
      </div>

    </div>
  );
}

export default AdminOrders;
