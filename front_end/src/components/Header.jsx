import "../styles/Header.css"
import { Link } from "react-router-dom";
import { useState } from "react";
import CartSidebar from "./CartSidebar";
import logoImg1 from "../assets/logo-1.png";

export default function Header() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="logo"> 
          <img src={logoImg1} alt="logo" className="lp-logo-image" />
        </div>

        <input
          type="text"
          className="search-bar"
          placeholder="Search for restaurants or dishes"
        />

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
