import "../styles/Header.css"
import { Link } from "react-router-dom";



export default function Header() {
  return (
    <header className="header">
      <div className="logo">🍽️ Logo</div>
      <input
        type="text"
        className="search-bar"
        placeholder="Search for restaurants or dishes"
      />
      <div className="header-right">
        <button id="header-my-cart"><i class="fa-solid fa-cart-arrow-down"></i></button>
        <Link to="/account" id="header-my-account"><i class="fa-solid fa-user"></i></Link>
      </div>
    </header>
  );
}
