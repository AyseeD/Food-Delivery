import React, { useState, useEffect } from "react";
import RestaurantForm from "./RestaurantForm";
import MenuManager from "./MenuManager";
import "../../styles/AdminRestaurants.css";

function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // FETCH RESTAURANTS (Backend)
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const result = await fetch("http://localhost:4000/restaurants");
        const data = await result.json();
        setRestaurants(data);
      } catch (error) {
        console.error("Failed to load restaurants:", error);
      }
    }

    fetchRestaurants();
  }, []);

  // DELETE RESTAURANT
  const deleteRestaurant = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this restaurant?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:4000/restaurants/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Delete failed");
        return;
      }

      if (data.action === "deleted") {
        // Remove restaurant from list
        setRestaurants((prev) => prev.filter((r) => r.restaurant_id !== id));
        alert("Restaurant permanently deleted.");
      } else if (data.action === "deactivated") {
        // Update restaurant in list to show as inactive
        setRestaurants((prev) =>
          prev.map((r) =>
            r.restaurant_id === id ? { ...r, is_active: false } : r
          )
        );
        alert("Restaurant has existing orders. It has been deactivated instead of deleted.");
      }

    } catch (err) {
      console.error("Failed to delete restaurant:", err);
      alert("Failed to delete restaurant");
    }
  };

  return (
    <div className="admin-restaurants">
      <div className="top-bar">
        <h2 className="page-title">Restaurants</h2>
        <button className="add-btn" onClick={() => setShowAddForm(true)}>
          + Add Restaurant
        </button>
      </div>

      {/* RESTAURANT LIST */}
      <div className="restaurant-list">
        {restaurants.map(rest => (
          <div className="restaurant-card" key={rest.restaurant_id}>
            <img src={rest.restaurant_img} alt="" className="restaurant-img" />
            
            <div className="restaurant-info">
              <h3>{rest.name}</h3>
              {!rest.is_active && (
                <span className="inactive-badge">Inactive</span>
              )}
              <p className="restaurant-tags">
                {rest.tags?.map(tag => tag.name).join(", ")}
              </p>
            </div>

            <div className="buttons">
              <button className="menu-btn" onClick={() => setSelectedRestaurant(rest)}>
                Manage Menu
              </button>

              <button
                className="edit-btn"
                onClick={() => setSelectedRestaurant({ ...rest, mode: "edit" })}
              >
                Edit
              </button>

              <button 
                className="delete-btn" 
                onClick={() => deleteRestaurant(rest.restaurant_id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* POPUPS */}
      {showAddForm && (
        <RestaurantForm
          closeForm={() => setShowAddForm(false)}
          setRestaurants={setRestaurants}
        />
      )}

      {selectedRestaurant?.mode === "edit" && (
        <RestaurantForm
          closeForm={() => setSelectedRestaurant(null)}
          setRestaurants={setRestaurants}
          restaurant={selectedRestaurant}
        />
      )}

      {selectedRestaurant && !selectedRestaurant.mode && (
        <MenuManager
          restaurant={selectedRestaurant}
          close={() => setSelectedRestaurant(null)}
          setRestaurants={setRestaurants}
        />
      )}
    </div>
  );
}

export default AdminRestaurants;