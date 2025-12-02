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
  const deleteRestaurant = (id) => {
    
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
          <div className="restaurant-card" key={rest.id}>
            <img src={rest.restaurant_img} alt="" className="restaurant-img" />

            <h3>{rest.name}</h3>

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


              <button className="delete-btn" onClick={() => deleteRestaurant(rest.id)}>
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
