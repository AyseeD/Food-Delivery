import { useState } from "react";
import CategorySlider from "../components/CategorySlider";
import RestaurantCard from "../components/RestaurantCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/Home.css"


export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["Burger", "Pizza", "Sushi", "Italian"];

  const restaurants = [
    {
      id: 1,
      name: "Burger King",
      category: "Burger",
      distance: 3.2,
      time: 20,
      image: "/images/burger.jpg",
    }
  ];

  const filteredRestaurants =
    selectedCategory === "All"
      ? restaurants
      : restaurants.filter((r) => r.category === selectedCategory);

  return (

    <div id="home-page-wrapper">
      <Header />

      <div className="home-page">

        <h2>Food Categories</h2>
        <CategorySlider
          categories={["Burger", "Pizza", "Sushi", "Italian"]}
          onSelectCategory={setSelectedCategory}
          autoplay={true}
          intervalMs={2200}
          stepPx={220}
          pauseOnHover={true}
        />


        <h2>Restaurants</h2>
        <div className="restaurant-list">
          {filteredRestaurants.map((r) => (
            <RestaurantCard key={r.id} {...r} />
          ))}
        </div>

      </div>

    <Footer />
  </div>  
  );
}
