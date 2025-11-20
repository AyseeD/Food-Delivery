// src/components/CartSidebar.jsx
import "../styles/CartSidebar.css";

export default function CartSidebar({ isOpen, onClose }) {
  return (
    <div className={`cart-sidebar ${isOpen ? "open" : ""}`}>
      <div className="cart-header">
        <h2>Cart</h2>
        <button onClick={onClose} className="close-btn">✖</button>
      </div>

      <div className="cart-items">
        {/*Eşyalar burda olacak */}
      </div>
    </div>
  );
}
