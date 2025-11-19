import { useParams } from "react-router-dom";
import { useState } from "react";
import "../styles/RestaurantPage.css";

export default function RestaurantPage() {
  const { id } = useParams();
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Example data (for now)
  const restaurants = [
    {
      id: 1,
      name: "Burger King",
      description: "Classic American-style burgers, fries and drinks.",
      distance: 3.2,
      time: 20,
      image: "/images/burger.jpg",
      categories: ["All", "Burgers", "Sides", "Drinks"],
      menu: [
        { id: 1, name: "Double Cheeseburger", price: 225, img: "/images/menu-double.jpg", category: "Burgers", description: "Grilled beef patty, fresh lettuce, tomato, onion, pickles, mayo & ketchup."},
        { id: 2, name: "King Fries", price: 60, img: "/images/menu-fries.jpg", category: "Sides", description: "Crispy golden fries sprinkled with sea salt."},
        { id: 3, name: "Coca Cola", price: 50, img: "/images/menu-cola.jpg", category: "Drinks", description: "Chilled Coca Cola — perfect with your meal."},
      ],
    }
    
  ];

  const restaurant = restaurants.find((r) => r.id === Number(id));
  if (!restaurant) return <p>Restaurant not found.</p>;

  // Filter by Category
  const filteredMenu =
    selectedCategory === "All"
      ? restaurant.menu
      : restaurant.menu.filter((item) => item.category === selectedCategory);




  return (
    <div className="restaurant-page">
      {/* Page Title */}
      <div className="restaurant-top">
        <div className="restaurant-image">
          <img src={restaurant.image} alt={restaurant.name} />
        </div>
        <div className="restaurant-details">
          <h2>{restaurant.name}</h2>
          <p>{restaurant.description}</p>
          <p>{restaurant.distance} km • {restaurant.time} min </p>
        </div>
      </div>

      {/* Page Content */}
      <div className="restaurant-content">
        {/* Left Side: Categories */}
        <aside className="restaurant-categories">
          <h3>Categories</h3>
          <ul>
            {restaurant.categories.map((cat, index) => (
              <li
                key={index}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? "active" : ""}
              >
                {cat}
              </li>
            ))}
          </ul>
        </aside>

        {/* Right Side: Menu Cards */}
        <section className="restaurant-menu">
          <h3>Menu — {selectedCategory}</h3>

          {filteredMenu.length === 0 ? (
            <p className="no-items">No items found for {selectedCategory}</p>
          ) : (

           <div className="menu-grid">
            {filteredMenu.map((item) => (
              <div key={item.id} className="menu-card">
                <img src={item.img} alt={item.name} className="menu-img" />
                <div className="menu-info">

                  <h4>{item.name}</h4>

                  <p className="menu-desc">{item.description}</p>
                  

                  <div className="menu-bottom">
                    <span className="menu-price">{item.price}₺</span>
                    <button className="add-btn">Add to Cart</button>
                  </div>

                </div>
              </div>
            ))}
          </div>



          )}
        </section>
      </div>
    </div>
  );
}
