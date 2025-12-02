import React, { useState } from "react";
import "../../styles/RestaurantForm.css";

function RestaurantForm({ closeForm, setRestaurants, restaurant }) {
  const isEdit = Boolean(restaurant);

  const [form, setForm] = useState({
    name: restaurant?.name || "",
    description: restaurant?.description || "",
    address: restaurant?.address || "",
    rating: restaurant?.rating || "",
    is_active: restaurant?.is_active ?? true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = isEdit ? "PUT" : "POST";
    const url = isEdit
      ? `http://localhost:4000/restaurants/${restaurant.restaurant_id}`
      : "http://localhost:4000/restaurants";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (isEdit) {
        setRestaurants(prev =>
          prev.map(r => r.restaurant_id === data.restaurant_id ? data : r)
        );
      } else {
        setRestaurants(prev => [...prev, data]);
      }

      closeForm();
    } catch (err) {
      console.error("Failed:", err);
      alert(`Failed to ${isEdit ? "update" : "add"} restaurant: ${err.message}`);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3>{isEdit ? "Edit Restaurant" : "Add Restaurant"}</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Restaurant Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <input
            type="text"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />

          <input
            type="number"
            placeholder="Rating"
            step="0.1"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
          />

          <select
            value={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.value === "true" })}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <button className="submit-btn">
            {isEdit ? "Save Changes" : "Add Restaurant"}
          </button>
        </form>

        <button className="close-btn" onClick={closeForm}>Close</button>
      </div>
    </div>
  );
}

export default RestaurantForm;
