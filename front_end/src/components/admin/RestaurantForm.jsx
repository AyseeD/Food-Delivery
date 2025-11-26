import React, { useState } from "react";
import "../../styles/RestaurantForm.css";

function RestaurantForm({ closeForm, setRestaurants }) {

  const [form, setForm] = useState({
    name: "",
    image: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    setRestaurants(prev => [
      ...prev,
      {
        id: Date.now(),
        name: form.name,
        image: URL.createObjectURL(form.image),
        menus: []
      }
    ]);

    closeForm();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3>Add Restaurant</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Restaurant Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <label className="file-upload">
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
              required
            />
          </label>

          <button className="submit-btn">Add Restaurant</button>
        </form>

        <button className="close-btn" onClick={closeForm}>Close</button>
      </div>
    </div>
  );
}

export default RestaurantForm;
