import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import CategorySlider from "../components/CategorySlider";
import RestaurantCard from "../components/RestaurantCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/Home.css"

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [homeSearchTerm, setHomeSearchTerm] = useState(""); // Add state for home search
  const navigate = useNavigate(); // Add navigate

  // Fetch restaurants
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const res = await fetch("http://localhost:4000/restaurants");
        const data = await res.json();
        setRestaurants(data);
      } catch (err) {
        console.error("Failed to load restaurants:", err);
      }
      setLoading(false);
    }

    fetchRestaurants();
  }, []);

  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch("http://localhost:4000/tags");
        const data = await res.json();

        const uniqueTags = [];
        const seen = new Set();

        data.forEach(tag => {
          if (!seen.has(tag.name)) {
            uniqueTags.push({ name: tag.name, img_url: tag.img_url });
            seen.add(tag.name);
          }
        });

        setCategories(uniqueTags);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }

    fetchTags();
  }, []);

  // Handle home page search
  const handleHomeSearch = (e) => {
    e.preventDefault();
    if (homeSearchTerm.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(homeSearchTerm.trim())}`);
      setHomeSearchTerm("");
    } else {
      alert("Please enter at least 2 characters to search");
    }
  };

  // Filter restaurants by tag
  const filteredRestaurants = 
    selectedCategory === "All"
      ? restaurants
      : restaurants.filter(r => {
          return r.tags.some(tag => tag.name === selectedCategory);
        });

  return (
    <div id="home-page-wrapper">
      <Header />

      <div className="home-page">
        <div className="home-hero">
          <h1>Order food to your door</h1>
          <p>Discover the best restaurants in your area</p>
          
          {/* Home page search bar */}
          <form className="home-search-form" onSubmit={handleHomeSearch}>
            <input
              type="text"
              placeholder="What are you craving today?"
              value={homeSearchTerm}
              onChange={(e) => setHomeSearchTerm(e.target.value)}
              className="home-search-input"
            />
            <button type="submit" className="home-search-button">
              <i className="fa-solid fa-magnifying-glass"></i> Search
            </button>
          </form>
        </div>

        <h2>Food Categories</h2>
        <CategorySlider
          categories={categories}
          onSelectCategory={setSelectedCategory}
          autoplay={true}
          intervalMs={2200}
          stepPx={220}
          pauseOnHover={true}
        />

        <h2>Restaurants</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="restaurant-list">
            {filteredRestaurants.map((r) => (
              <RestaurantCard 
                key={r.restaurant_id || r.id}
                name={r.name}
                category={r.tags?.[0]?.name || "Unknown"}
                distance={Math.floor(Math.random() * 10) + 1}
                time={Math.floor(Math.random() * 60) + 10}
                image={r.restaurant_img}
                id={r.restaurant_id || r.id}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}