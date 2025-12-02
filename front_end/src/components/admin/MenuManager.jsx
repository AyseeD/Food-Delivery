import React, { useState, useEffect } from "react";
import "../../styles/MenuManager.css";

function MenuManager({ restaurant, close, setRestaurants}) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category_id: "",
    is_available: true,
    tags: []
  });

  // Fetch menu items, categories, and tags
  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
    fetchTags();
  }, [restaurant.restaurant_id]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`http://localhost:4000/menu/restaurant/${restaurant.restaurant_id}`);
      const data = await response.json();
      setMenuItems(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // You'll need to create this endpoint or adjust based on your DB
      const response = await fetch(`http://localhost:4000/menu/categories/${restaurant.restaurant_id}`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("http://localhost:4000/menu/tags");
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  // Add new menu item
  const addMenuItem = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:4000/menu/item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({
          restaurant_id: restaurant.restaurant_id,
          ...newItem,
          price: parseFloat(newItem.price)
        })
      });

      if (!response.ok) throw new Error("Failed to add item");
      
      const data = await response.json();
      
      // Refresh menu items
      fetchMenuItems();
      
      // Reset form
      setNewItem({
        name: "",
        description: "",
        price: "",
        image_url: "",
        category_id: "",
        is_available: true,
        tags: []
      });
      
    } catch (error) {
      console.error("Error adding menu item:", error);
      alert("Failed to add menu item");
    }
  };

  // Update existing menu item
  const updateMenuItem = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:4000/menu/item/${editingItem.item_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({
          ...editingItem,
          price: parseFloat(editingItem.price)
        })
      });

      if (!response.ok) throw new Error("Failed to update item");
      
      // Refresh menu items
      fetchMenuItems();
      
      // Reset editing state
      setEditingItem(null);
      
    } catch (error) {
      console.error("Error updating menu item:", error);
      alert("Failed to update menu item");
    }
  };

  // Delete menu item
  const deleteMenuItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const response = await fetch(`http://localhost:4000/menu/item/${itemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
      });

      if (!response.ok) throw new Error("Failed to delete item");
      
      // Refresh menu items
      fetchMenuItems();
      
    } catch (error) {
      console.error("Error deleting menu item:", error);
      alert("Failed to delete menu item");
    }
  };

  // Toggle item availability
  const toggleAvailability = async (item) => {
    try {
      const response = await fetch(`http://localhost:4000/menu/item/${item.item_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({
          is_available: !item.is_available
        })
      });

      if (!response.ok) throw new Error("Failed to update availability");
      
      // Refresh menu items
      fetchMenuItems();
      
    } catch (error) {
      console.error("Error toggling availability:", error);
      alert("Failed to update availability");
    }
  };

  // Handle tag selection
  const handleTagToggle = (tagName, isEditing = false) => {
    if (isEditing) {
      setEditingItem(prev => {
        // Check if tag already exists (compare by name)
        const tagExists = prev.tags?.some(t => 
          typeof t === 'object' ? t.name === tagName : t === tagName
        );
        
        const newTags = tagExists
          ? prev.tags.filter(t => 
              typeof t === 'object' ? t.name !== tagName : t !== tagName
            )
          : [...prev.tags, tagName];
        return { ...prev, tags: newTags };
      });
    } else {
      setNewItem(prev => {
        const tagExists = prev.tags.includes(tagName);
        const newTags = tagExists
          ? prev.tags.filter(t => t !== tagName)
          : [...prev.tags, tagName];
        return { ...prev, tags: newTags };
      });
    }
  };

  if (loading) {
    return (
      <div className="popup-overlay">
        <div className="popup-box menu-manager-box">
          <p>Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-overlay">
      <div className="popup-box menu-manager-box">
        <div className="menu-manager-header">
          <h3>Manage Menu – {restaurant.name}</h3>
          <button className="close-btn" onClick={close}>×</button>
        </div>

        {/* EXISTING MENU ITEMS */}
        <div className="menu-items-list">
          <h4>Menu Items ({menuItems.length})</h4>
          {menuItems.length === 0 ? (
            <p className="no-items">No menu items yet. Add your first item below.</p>
          ) : (
            menuItems.map(item => (
              <div className="menu-item-card" key={item.item_id}>
                <div className="item-image">
                  <img src={item.image_url || "/placeholder-food.jpg"} alt={item.name} />
                </div>
                <div className="item-details">
                  <div className="item-header">
                    <h4>{item.name}</h4>
                    <span className={`status ${item.is_available ? 'available' : 'unavailable'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <p className="item-description">{item.description}</p>
                  <p className="item-price">{item.price}₺</p>
                  <p className="item-category">Category: {item.category_name || 'Uncategorized'}</p>
                  <div className="item-tags">
                    {item.tags.map(tag => (
                      <span key={tag.tag_id} className="tag">{tag.name}</span>
                    ))}
                  </div>
                  {item.options.length > 0 && (
                    <div className="item-options">
                      <small>Options: {item.options.map(opt => opt.name).join(', ')}</small>
                    </div>
                  )}
                </div>
                <div className="item-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => {
                      const normalizedItem = {
                        ...item,
                        tags: item.tags.map(t => typeof t === 'object' ? t.name : t)
                      };
                      setEditingItem(normalizedItem);
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    className={`toggle-btn ${item.is_available ? 'disable-btn' : 'enable-btn'}`}
                    onClick={() => toggleAvailability(item)}
                  >
                    {item.is_available ? 'Disable' : 'Enable'}
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteMenuItem(item.item_id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* EDIT FORM */}
        {editingItem && (
          <div className="edit-form-overlay">
            <div className="edit-form">
              <h4>Edit Menu Item</h4>
              <form onSubmit={updateMenuItem}>
                <input
                  type="text"
                  placeholder="Item Name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={editingItem.image_url || ''}
                  onChange={(e) => setEditingItem({...editingItem, image_url: e.target.value})}
                />
                <select
                  value={editingItem.category_id || ''}
                  onChange={(e) => setEditingItem({...editingItem, category_id: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="tags-selection">
                  <p>Select Tags:</p>
                  <div className="tags-list">
                    {tags.map(tag => (
                      <label key={tag.tag_id} className="tag-checkbox">
                        <input
                          type="checkbox"
                          checked={editingItem.tags?.some(t => 
                            typeof t === 'object' ? t.name === tag.name : t === tag.name
                          )}
                          onChange={() => handleTagToggle(tag.name, true)}
                        />
                        {tag.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-buttons">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button type="button" className="cancel-btn" onClick={() => setEditingItem(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD NEW ITEM FORM */}
        <div className="add-item-form">
          <h4>Add New Menu Item</h4>
          <form onSubmit={addMenuItem}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Price"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                required
              />
            </div>
            <textarea
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
            />
            <div className="form-row">
              <input
                type="text"
                placeholder="Image URL"
                value={newItem.image_url}
                onChange={(e) => setNewItem({...newItem, image_url: e.target.value})}
              />
              <select
                value={newItem.category_id}
                onChange={(e) => setNewItem({...newItem, category_id: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="tags-selection">
              <p>Select Tags:</p>
              <div className="tags-list">
                {tags.map(tag => (
                  <label key={tag.tag_id} className="tag-checkbox">
                    <input
                      type="checkbox"
                      checked={newItem.tags.includes(tag.name)}
                      onChange={() => handleTagToggle(tag.name, false)}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="add-btn">Add Item</button>
              <button type="button" className="close-form-btn" onClick={close}>
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MenuManager;