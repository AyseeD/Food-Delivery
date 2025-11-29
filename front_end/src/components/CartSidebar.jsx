import { useEffect, useState } from "react";
import "../styles/CartSidebar.css";

export default function CartSidebar({ isOpen, onClose }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    async function loadCart() {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4000/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setCartItems(data.items || []);

    }

    loadCart();
    console.log("CART ITEMS:", cartItems);
  }, [isOpen]);

  return (
    <div className={`cart-sidebar ${isOpen ? "open" : ""}`}>
      <div className="cart-header">
        <h2>Your Cart</h2>
        <button onClick={onClose} className="cart-close-btn">✖</button>
      </div>

      <div className="cart-items">
        {cartItems.length === 0 && <p>Your cart is empty.</p>}

        {cartItems.map(item => (
          <div key={item.cart_item_id} className="cart-entry">
            <img src={item.image_url} alt={item.name} className="cart-img" />

            <div>
              <h4>{item.name}</h4>
              <p>Base: {item.price_at_add} ₺</p>

              {item.options?.length > 0 && (
                <ul className="cart-options">
                  {item.options.map(opt => (
                    <li key={opt.option_id}>
                      ➕ {opt.name} (+{opt.additional_price} ₺)
                    </li>
                  ))}
                </ul>
              )}

              <strong>
                Total:{" "}
                {
                  Number(item.price_at_add) +
                  item.options?.reduce(
                    (sum, opt) => sum + Number(opt.additional_price),
                    0
                  )
                } ₺
              </strong>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
