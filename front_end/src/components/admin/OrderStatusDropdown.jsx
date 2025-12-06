import React from "react";
import "../../styles/OrderStatusDropdown.css";

function OrderStatusDropdown({ currentStatus, onChange }) {
  const statuses = [
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "preparing", label: "Preparing" },
    { value: "delivering", label: "Delivering" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "picked_up", label: "Picked Up" }
  ]; //statuses for orders

  return (
    <select
      className="status-select"
      value={currentStatus}
      onChange={(e) => onChange(e.target.value)}
    >
      {statuses.map(s => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

export default OrderStatusDropdown;
