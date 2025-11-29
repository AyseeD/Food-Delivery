import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/RestaurantPage.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ItemModal from "../components/ItemModal";

export default function RestaurantPage() {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(true);

  function openModal(itemId) {
    setSelectedItemId(itemId);
  }

  function closeModal() {
    setSelectedItemId(null);
  }

  async function handleAddToCart(item, selectedOptions) {
    try {
      const token = localStorage.getItem("token");

      await fetch("http://localhost:4000/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_id: item.item_id,
          options: selectedOptions || [],
        }),
      });

      closeModal();
      alert("Added to cart!");
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  }

  // --- Fetch Restaurant Info ---
  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const res = await fetch(`http://localhost:4000/restaurants/${id}`);
        const data = await res.json();
        setRestaurant(data);
      } catch (error) {
        console.error("Failed to fetch restaurant:", error);
      }
    }

    fetchRestaurant();
  }, [id]);

  // --- Fetch Menu ---
  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch(`http://localhost:4000/menu/restaurant/${id}`);
        const data = await res.json();

        setMenuItems(Array.isArray(data) ? data : []);

        const uniqueCategories = [
          "All",
          ...new Set(
            (data || []).map(item => item.category_name || "Other")
          ),
        ];

        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to load menu:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, [id]);

  // --- Loading States ---
  if (loading) return <p>Loading menu...</p>;
  if (!restaurant) return <p>Restaurant not found.</p>;

  // --- Filter Menu By Category ---
  const filteredMenu =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter(item => item.category_name === selectedCategory);

  return (
    <div className="restaurant-page">
      <Header />

      <div className="page-title-wrapper">
        <div className="restaurant-top">
          <div className="restaurant-image">
            <img src={restaurant.restaurant_img} alt={restaurant.name} />
          </div>

          <div className="restaurant-details">
            <h2>{restaurant.name}</h2>
            <p>{restaurant.description}</p>
            <p>{restaurant.address}</p>
          </div>
        </div>

        <div className="restaurant-content">
          {/* === CATEGORIES SIDEBAR === */}
          <aside className="restaurant-categories">
            <h3>Categories</h3>
            <ul>
              {categories.map((cat, idx) => (
                <li
                  key={idx}
                  className={selectedCategory === cat ? "active" : ""}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </aside>

          {/* === MENU ITEMS === */}
          <section className="restaurant-menu">
            <h3>Menu — {selectedCategory}</h3>

            {filteredMenu.length === 0 ? (
              <p>No items found in this category.</p>
            ) : (
              <div className="menu-grid">
                {filteredMenu.map((item) => (
                  <div key={item.item_id} className="menu-card">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="menu-img"
                    />

                    <div className="menu-info">
                      <h4>{item.name}</h4>
                      <p className="menu-desc">{item.description}</p>

                      <div className="menu-bottom">
                        <span className="menu-price">{item.price} ₺</span>

                        <button
                          className="res-add-btn"
                          onClick={() => openModal(item.item_id)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedItemId && (
        <ItemModal
          itemId={selectedItemId}
          onClose={closeModal}
          onAdd={handleAddToCart}
        />
      )}


      <Footer />
    </div>
  );
}
