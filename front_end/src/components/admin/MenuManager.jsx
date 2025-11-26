import React, { useState } from "react";
import "../../styles/MenuManager.css";

function MenuManager({ restaurant, close, setRestaurants }) {
  const [newMenu, setNewMenu] = useState({
    name: "",
    price: "",
    image: null
  });

  const addMenu = (e) => {
    e.preventDefault();

    const newItem = {
      id: Date.now(),
      name: newMenu.name,
      price: newMenu.price,
      image: URL.createObjectURL(newMenu.image)
    };

    // backend POST

    setRestaurants(prev =>
      prev.map(r =>
        r.id === restaurant.id
          ? { ...r, menus: [...r.menus, newItem] }
          : r
      )
    );
  };

  const deleteMenu = (menuId) => {
    // backend DELETE
    setRestaurants(prev =>
      prev.map(r =>
        r.id === restaurant.id
          ? { ...r, menus: r.menus.filter(m => m.id !== menuId) }
          : r
      )
    );
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box menu-manager-box">

        <h3>Manage Menu – {restaurant.name}</h3>

        {/* EXISTING MENUS */}
        <div className="menu-list">
          {restaurant.menus.map(m => (
            <div className="menu-item" key={m.id}>
              <img src={m.image} alt="" />
              <p>{m.name}</p>
              <p className="price">{m.price}₺</p>
              <button className="delete-btn" onClick={() => deleteMenu(m.id)}>Delete</button>
            </div>
          ))}
        </div>

        {/* ADD NEW MENU */}
        <form onSubmit={addMenu} className="add-menu-form">

          <input
            type="text"
            placeholder="Menu Name"
            value={newMenu.name}
            onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
            required
          />

          <input
            type="number"
            placeholder="Price"
            value={newMenu.price}
            onChange={(e) => setNewMenu({ ...newMenu, price: e.target.value })}
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewMenu({ ...newMenu, image: e.target.files[0] })}
            required
          />


          <div className="modal-buttons">
            <button className="add-menu-btn">Add Menu Item</button>
            <button className="close-menu-btn" onClick={close}>Close</button>
          </div>

        </form>

      
      </div>
    </div>
  );
}

export default MenuManager;
