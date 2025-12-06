import "../styles/Header.css"
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import CartSidebar from "./CartSidebar";
import logoImg1 from "../assets/logo-1.png";

export default function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  //for searching restaurant or items
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(""); //clear input after search
    } else {
      alert("Please enter at least 2 characters to search");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <>
      <header className="header">
        <div className="logo"> 
          <a href="/home"><img src={logoImg1} alt="logo" className="lp-logo-image" /></a>
        </div>

        <form className="search-container" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-bar"
            placeholder="Search for restaurants or dishes"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button type="submit" className="search-button">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>

        <div className="header-right">
          <button id="header-my-cart" onClick={() => setCartOpen(true)}> 
            <i className="fa-solid fa-cart-arrow-down"></i> My Cart
          </button>

          <Link to="/account" id="header-my-account">
            <i className="fa-solid fa-user"></i> My Account
          </Link>
        </div>
      </header>

      {/* Cart sidebar */}
      <CartSidebar 
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  );
}