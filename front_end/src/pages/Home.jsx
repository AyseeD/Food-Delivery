import { useState, useEffect } from "react";
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


  // Filter restaurants by tag
  const filteredRestaurants =
    selectedCategory === "All"
      ? restaurants
      : restaurants.filter(r => r.tags.includes(selectedCategory))

  return (
    <div id="home-page-wrapper">
      <Header />

      <div className="home-page">
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
                key={r.id}
                name={r.name}
                category={r.tags?.[0] || "Unknown"} 
                distance={Math.floor(Math.random() * 10) + 1}
                time={Math.floor(Math.random() * 60) + 10}
                image={r.restaurant_img}
                id={r.restaurant_id}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
