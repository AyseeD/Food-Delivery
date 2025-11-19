import { Link } from "react-router-dom";
import "../styles/RestaurantCard.css";

export default function RestaurantCard({ id, name, category, distance, time, image }) {
  return (
    <div className="restaurant-card">
      <img src={image} alt={name} />
      <h3>{name}</h3>
      <p>{category}</p>
      <p>{distance} km • {time} min</p>
      <Link to={`/restaurant/${id}`}>
        <button className="view-btn">View Menu</button>
      </Link>
    </div>
  );
}
