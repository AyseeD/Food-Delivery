import { useEffect, useState } from "react";
import "../styles/CartSidebar.css";

export default function CartSidebar({ isOpen, onClose }) {
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load cart from backend
  async function loadCart() {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setCartItems(data.items || []);
      
      // Get restaurant ID from first item (assuming all items from same restaurant)
      if (data.items && data.items.length > 0) {
        // Now restaurant_id is directly available from cart items
        const firstRestaurantId = data.items[0]?.restaurant_id;
        if (firstRestaurantId) {
          setRestaurantId(firstRestaurantId);
          
          // Optional: Check if all items are from the same restaurant
          const allSameRestaurant = data.items.every(
            item => item.restaurant_id === firstRestaurantId
          );
          
          if (!allSameRestaurant) {
            console.warn("Cart contains items from different restaurants");
            // You might want to handle this case - e.g., show a warning
          }
        }
      } else {
        setRestaurantId(null);
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) loadCart();
  }, [isOpen]);

  // DELETE cart item
  async function deleteItem(cartItemId) {
    const token = localStorage.getItem("token");

    try {
      await fetch(`http://localhost:4000/cart/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh cart
      loadCart();
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert("Failed to delete item from cart");
    }
  }

  // Apply promotion code
  async function applyPromoCode() {
    if (!promoCode.trim()) {
      alert("Please enter a promo code");
      return;
    }

    if (!restaurantId) {
      alert("Cannot apply promo code to empty cart or cart with items from different restaurants");
      return;
    }

    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`http://localhost:4000/promotions/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          promo_code: promoCode,
          restaurant_id: restaurantId
        })
      });

      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }

      setAppliedPromotion(data.promotion);
      alert(`Promo code applied! You get ${data.promotion.discount_percent}% off`);
    } catch (err) {
      console.error("Failed to apply promo:", err);
      alert("Invalid promo code or expired");
    }
  }

  async function updateQuantity(cartItemId, newQuantity) {
    if (newQuantity < 1) {
      // If quantity becomes 0, remove item
      deleteItem(cartItemId);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      await fetch(`http://localhost:4000/cart/${cartItemId}/quantity`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      // Refresh cart
      loadCart();
    } catch (err) {
      console.error("Failed to update quantity:", err);
      alert("Failed to update quantity");
    }
  }

  // Remove promotion
  function removePromotion() {
    setAppliedPromotion(null);
    setPromoCode("");
  }

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const basePrice = Number(item.price_at_add || 0);
      const optionsTotal = item.options?.reduce((sum, opt) => 
        sum + Number(opt.additional_price || 0), 0) || 0;
      const pricePerItem = basePrice + optionsTotal;
      const itemTotal = pricePerItem * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  // Calculate discount
  const calculateDiscount = () => {
    if (!appliedPromotion) return 0;
    const subtotal = calculateSubtotal();
    return (subtotal * appliedPromotion.discount_percent) / 100;
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  async function submitOrder() {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const token = localStorage.getItem("token");

    const orderData = {
      promo_code: appliedPromotion?.code || null
    };

    try {
      const res = await fetch("http://localhost:4000/orders/from-cart", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();

      if (data.error) {
        alert("Failed to place order: " + data.error);
        return;
      }
      
      if (data.orders && data.orders.length > 1) {
        alert(`Order placed successfully! Created ${data.orders.length} separate orders for different restaurants.`);
      } else {
        alert("Order placed successfully!");
      }
      
      onClose();
      setCartItems([]);
      setAppliedPromotion(null);
      setPromoCode("");
      setRestaurantId(null);
      window.location.reload();
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("Failed to place order. Please try again.");
    }
  }

  return (
    <div className={`cart-sidebar ${isOpen ? "open" : ""}`}>
      <div className="cart-header">
        <h2>Your Cart</h2>
        <button onClick={onClose} className="cart-close-btn">✖</button>
      </div>

      <hr />

      {/* Promotion Section */}
      <div className="promotion-section">
        <h3>Promo Code</h3>
        {appliedPromotion ? (
          <div className="applied-promo">
            <p>
              <strong>{appliedPromotion.code}</strong> - {appliedPromotion.discount_percent}% off
              <button onClick={removePromotion} className="remove-promo-btn">Remove</button>
            </p>
            <small>{appliedPromotion.description}</small>
          </div>
        ) : (
          <div className="promo-input-group">
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="promo-input"
              disabled={!restaurantId || cartItems.length === 0}
            />
            <button 
              onClick={applyPromoCode} 
              className="apply-promo-btn"
              disabled={!restaurantId || cartItems.length === 0}
            >
              Apply
            </button>
          </div>
        )}
        {(!restaurantId || cartItems.length === 0) && !appliedPromotion && (
          <small className="promo-note">Add items to cart to apply promo codes</small>
        )}
      </div>

      <hr />

      <div className="cart-items">
        {loading ? (
          <p>Loading cart...</p>
        ) : cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cartItems.map(item => {
            const itemTotal = (Number(item.price_at_add || 0) +
              (item.options?.reduce((sum, opt) => sum + Number(opt.additional_price || 0), 0) || 0)) * item.quantity;

            return (
              <div key={item.cart_item_id} className="cart-entry">
                <img src={item.image_url || "/placeholder-food.jpg"} alt={item.name} className="cart-img" />

                <div className="cart-info">
                  <h4>{item.name}</h4>
                  <p>Base: {item.price_at_add || 0} ₺</p>

                  {/* Add Quantity Controls */}
                  <div className="cart-quantity">
                    <button 
                      className="quantity-btn-small"
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="quantity-display-small">{item.quantity}</span>
                    <button 
                      className="quantity-btn-small"
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  {item.options?.length > 0 && (
                    <ul className="cart-options">
                      {item.options.map(opt => (
                        <li key={opt.option_id}>
                          ➕ {opt.name} (+{opt.additional_price || 0} ₺)
                        </li>
                      ))}
                    </ul>
                  )}

                  <strong>Item Total: {itemTotal.toFixed(2)} ₺</strong>
                </div>

                <button
                  className="cart-delete-btn"
                  onClick={() => deleteItem(item.cart_item_id)}
                >
                  🗑
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Order Summary */}
      {cartItems.length > 0 && (
        <div className="order-summary">
          <hr />
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>{calculateSubtotal().toFixed(2)} ₺</span>
          </div>
          
          {appliedPromotion && (
            <div className="summary-row discount">
              <span>Discount ({appliedPromotion.discount_percent}%):</span>
              <span>-{calculateDiscount().toFixed(2)} ₺</span>
            </div>
          )}
          
          <div className="summary-row total">
            <span><strong>Total:</strong></span>
            <span><strong>{calculateTotal().toFixed(2)} ₺</strong></span>
          </div>
        </div>
      )}

      {cartItems.length !== 0 && (
        <button className="order-button" onClick={submitOrder}>
          Order Now!
        </button>
      )}
    </div>
  );
}