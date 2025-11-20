import "../styles/Header.css"
import { Link } from "react-router-dom";
import { useState } from "react";
import CartSidebar from "./CartSidebar";

export default function Header() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="logo">🍽️ Logo</div>

        <input
          type="text"
          className="search-bar"
          placeholder="Search for restaurants or dishes"
        />

        <div className="header-right">
          {/*Cart sidebar açma */}
          <button id="header-my-cart" onClick={() => setCartOpen(true)}>
            <i className="fa-solid fa-cart-arrow-down"></i>
          </button>

          <Link to="/account" id="header-my-account">
            <i className="fa-solid fa-user"></i>
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
