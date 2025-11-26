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
   

    // TEMP DATA
    setRestaurants([
      {
        id: 1,
        name: "Burger King",
        image: "/sample/burgerking.png",
        menus: [
          { id: 10, name: "Whopper Menu", price: 240, image: "/sample/whopper.png" }
        ]
      },
      {
        id: 2,
        name: "Dominos Pizza",
        image: "/sample/dominos.png",
        menus: []
      }
    ]);
  }, []);

  // DELETE RESTAURANT
  const deleteRestaurant = (id) => {
    
    setRestaurants(prev => prev.filter(r => r.id !== id));
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
            <img src={rest.image} alt="" className="restaurant-img" />

            <h3>{rest.name}</h3>

            <div className="buttons">
              <button className="menu-btn" onClick={() => setSelectedRestaurant(rest)}>
                Manage Menu
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

      {selectedRestaurant && (
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
