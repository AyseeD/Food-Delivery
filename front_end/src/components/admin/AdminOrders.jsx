import React, { useEffect, useState } from "react";
import OrderStatusDropdown from "./OrderStatusDropdown";
import "../../styles/AdminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try{
        const result = await fetch("http://localhost:4000/orders/");
        const data = await result.json();
        setOrders(data);
      }catch(err){
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await fetch(`http://localhost:4000/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      // update local UI
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="admin-orders">
      <h2 className="orders-page-title">Orders</h2>

      <div className="orders-wrapper">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="restaurant-name">{order.restaurant}</span>
              <span className="order-id">Order #{order.id}</span>
            </div>

            <div className="order-body">
              <p><strong>User:</strong> {order.user}</p>
              <p><strong>Date:</strong> {new Date(order.date).toLocaleString()}</p>
              
              <div className="order-items-section">
                <strong>Items:</strong>
                <ul className="order-items">
                  {order.items && order.items.map((item, index) => (
                    <li key={index} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">× {item.quantity}</span>
                      <span className="item-price">{item.itemTotal}₺</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="order-footer">
              <div className="order-status-badge">
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-actions">
                <span className="order-price"><strong>Total: {order.total}₺</strong></span>
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