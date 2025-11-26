import React from "react";
import "../../styles/OrderStatusDropdown.css";

function OrderStatusDropdown({ currentStatus, onChange }) {
  const statuses = [
    { value: "pending", label: "Pending" },
    { value: "preparing", label: "Preparing" },
    { value: "delivered", label: "Delivered" },
    { value: "on-the-way", label: "On The Way" },
  ];

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
