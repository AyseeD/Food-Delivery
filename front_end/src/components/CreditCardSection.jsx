import { useState, useEffect } from "react";
import "../styles/CreditCardSection.css";

export default function CreditCardSection({ userId, token }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    card_nickname: "",
    card_number: "",
    card_holder: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
    is_default: false
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  //fetch credit cards
  useEffect(() => {
    if (userId) {
      loadCreditCards();
    }
  }, [userId]);

  const loadCreditCards = async () => {
    try {
      const res = await fetch(`http://localhost:4000/credit-cards/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setCards(data || []);
    } catch (err) {
      console.error("Failed to load credit cards", err);
    } finally {
      setLoading(false);
    }
  };

  //simple validation for credit cards (for demo not real)
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.card_number || formData.card_number.replace(/\D/g, '').length < 8) {
      newErrors.card_number = "Enter a card number (8+ digits for demo)";
    }
    
    if (!formData.card_holder?.trim()) {
      newErrors.card_holder = "Card holder name is required";
    }
    
    if (!formData.expiry_month || formData.expiry_month < 1 || formData.expiry_month > 12) {
      newErrors.expiry_month = "Invalid month";
    }
    
    const currentYear = new Date().getFullYear();
    if (!formData.expiry_year || formData.expiry_year < currentYear) {
      newErrors.expiry_year = "Invalid year";
    }
    
    if (!formData.cvv || formData.cvv.length < 3 || formData.cvv.length > 4) {
      newErrors.cvv = "Enter CVV (3-4 digits)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) return;
    
    try {
      const method = editingCard ? "PUT" : "POST";
      const url = editingCard 
        ? `http://localhost:4000/credit-cards/${editingCard.card_id}`
        : "http://localhost:4000/credit-cards";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          user_id: userId
        }),
      });
      
      if (res.ok) {
        setSuccessMessage(editingCard ? "Card updated successfully!" : "Card added successfully!");
        loadCreditCards();
        resetForm();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const data = await res.json();
        setErrors({ general: data.error || "Failed to save card" });
      }
    } catch (err) {
      console.error("Failed to save card", err);
      setErrors({ general: "Failed to save card. Please try again." });
    }
  };

  //handle delete
  const handleDelete = async (cardId) => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;
    
    try {
      const res = await fetch(`http://localhost:4000/credit-cards/${cardId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        loadCreditCards();
        setSuccessMessage("Card deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to delete card", err);
      setErrors({ general: "Failed to delete card" });
    }
  };

  //set default card
  const handleSetDefault = async (cardId) => {
    try {
      const res = await fetch(`http://localhost:4000/credit-cards/${cardId}/default`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });
      
      if (res.ok) {
        loadCreditCards();
        setSuccessMessage("Default card updated!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to set default card", err);
    }
  };

  //reset form
  const resetForm = () => {
    setFormData({
      card_nickname: "",
      card_number: "",
      card_holder: "",
      expiry_month: "",
      expiry_year: "",
      cvv: "",
      is_default: false
    });
    setEditingCard(null);
    setShowAddForm(false);
    setErrors({});
  };

  //start editing card
  const startEdit = (card) => {
    setEditingCard(card);
    setFormData({
      card_nickname: card.card_nickname || "",
      card_number: card.card_number,
      card_holder: card.card_holder,
      expiry_month: card.expiry_month.toString(),
      expiry_year: card.expiry_year.toString(),
      cvv: "***", //hidden for security
      is_default: card.is_default
    });
    setShowAddForm(true);
  };

  //get card type from number - not real cards so simplified
  const getCardType = (number) => {
    const firstDigit = number.charAt(0);
    if (firstDigit === '4') return "Visa";
    if (firstDigit === '5') return "Mastercard";
    if (firstDigit === '3') return "American Express";
    if (firstDigit === '6') return "Discover";
    return "Credit Card";
  };

  //handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  //format card number as user types
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.substring(0, 16);
    
    //add spaces every 4 digits
    let formatted = "";
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += " ";
      formatted += value[i];
    }
    
    setFormData({
      ...formData,
      card_number: value
    });
    
    //update displayed value
    e.target.value = formatted;
  };

  // for demo add some demo cards on first load if no cards exist
  const addDemoCards = () => {
    const currentYear = new Date().getFullYear();
    const demoCards = [
      {
        card_nickname: "My Primary Card",
        card_number: "4242424242424242",
        card_holder: "JOHN DOE",
        expiry_month: 12,
        expiry_year: currentYear + 2,
        cvv: "123",
        is_default: true
      },
      {
        card_nickname: "Backup Card",
        card_number: "5555555555554444",
        card_holder: "JANE SMITH",
        expiry_month: 6,
        expiry_year: currentYear + 1,
        cvv: "456",
        is_default: false
      }
    ];

    //add demo cards one by one
    demoCards.forEach(card => {
      fetch("http://localhost:4000/credit-cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...card,
          user_id: userId
        }),
      }).catch(err => console.error("Failed to add demo card", err));
    });

    //reload cards after adding demos
    setTimeout(() => loadCreditCards(), 500);
  };

  if (loading) {
    return <div className="loading-cards">Loading credit cards...</div>;
  }

  return (
    <div className="credit-cards-section">
      <div className="section-header">
        <h3>Payment Methods</h3>
        <div className="header-actions">
          {cards.length === 0 && (
            <button 
              className="btn-secondary"
              onClick={addDemoCards}
              style={{ marginRight: '10px' }}
            >
              <i className="fa-solid fa-magic"></i> Add Demo Cards
            </button>
          )}
          <button 
            className="btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <i className="fa-solid fa-plus"></i> Add New Card
          </button>
        </div>
      </div>

      <div className="demo-notice">
        <i className="fa-solid fa-info-circle"></i>
        <span>You can use test card numbers for this demo.</span>
      </div>

      <div className="demo-card-numbers">
        <p><strong>Demo Card Numbers:</strong></p>
        <ul>
          <li>Visa: <code>4242 4242 4242 4242</code></li>
          <li>Mastercard: <code>5555 5555 5555 4444</code></li>
          <li>American Express: <code>3782 822463 10005</code></li>
          <li>Any 16-digit number will work</li>
        </ul>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {errors.general && (
        <div className="error-message">{errors.general}</div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card-form-overlay">
          <div className="card-form-modal">
            <div className="modal-header">
              <h4>{editingCard ? "Edit Card" : "Add New Card"}</h4>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="credit-card-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Card Nickname (Optional)</label>
                  <input
                    type="text"
                    name="card_nickname"
                    value={formData.card_nickname}
                    onChange={handleInputChange}
                    placeholder="e.g., My Primary Card"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Card Number *</label>
                  <input
                    type="text"
                    name="card_display"
                    onChange={handleCardNumberChange}
                    placeholder="4242 4242 4242 4242"
                    defaultValue={formData.card_number ? formatCardNumber(formData.card_number) : ""}
                    className={errors.card_number ? "error" : ""}
                  />
                  {errors.card_number && (
                    <span className="error-text">{errors.card_number}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Card Holder Name *</label>
                  <input
                    type="text"
                    name="card_holder"
                    value={formData.card_holder}
                    onChange={handleInputChange}
                    placeholder="JOHN DOE"
                    className={errors.card_holder ? "error" : ""}
                  />
                  {errors.card_holder && (
                    <span className="error-text">{errors.card_holder}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Month *</label>
                  <select
                    name="expiry_month"
                    value={formData.expiry_month}
                    onChange={handleInputChange}
                    className={errors.expiry_month ? "error" : ""}
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {(i + 1).toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  {errors.expiry_month && (
                    <span className="error-text">{errors.expiry_month}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Expiry Year *</label>
                  <select
                    name="expiry_year"
                    value={formData.expiry_year}
                    onChange={handleInputChange}
                    className={errors.expiry_year ? "error" : ""}
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                  {errors.expiry_year && (
                    <span className="error-text">{errors.expiry_year}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>CVV *</label>
                  <input
                    type="password"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                    className={errors.cvv ? "error" : ""}
                  />
                  {errors.cvv && (
                    <span className="error-text">{errors.cvv}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    name="is_default"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="is_default">Set as default payment method</label>
                </div>
              </div>

              <div className="demo-tip">
                <i className="fa-solid fa-lightbulb"></i>
                <span>Tip: Use any card number for this demo. No real payments are processed.</span>
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn-primary">
                  {editingCard ? "Update Card" : "Add Card"}
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cards List */}
      <div className="cards-grid">
        {cards.length === 0 ? (
          <div className="no-cards">
            <i className="fa-solid fa-credit-card"></i>
            <p>No credit cards saved yet.</p>
            <p className="demo-hint">Click "Add Demo Cards" to add sample cards for testing.</p>
          </div>
        ) : (
          cards.map(card => {
            const cardType = getCardType(card.card_number);
            const lastFour = card.card_number.slice(-4);
            
            return (
              <div 
                key={card.card_id} 
                className={`credit-card-item ${card.is_default ? 'default' : ''}`}
              >
                <div className="card-header">
                  <div className="card-type">
                    <i className={`fa-brands fa-cc-${cardType.toLowerCase()}`}></i>
                    <span>{cardType}</span>
                  </div>
                  {card.is_default && (
                    <span className="default-badge">Default</span>
                  )}
                </div>
                
                <div className="card-number">
                  <i className="fa-solid fa-asterisk"></i>
                  <span>•••• •••• •••• {lastFour}</span>
                </div>
                
                <div className="card-details">
                  <div>
                    <small>Card Holder</small>
                    <p>{card.card_holder}</p>
                  </div>
                  <div>
                    <small>Expires</small>
                    <p>{card.expiry_month.toString().padStart(2, '0')}/{card.expiry_year}</p>
                  </div>
                </div>
                
                {card.card_nickname && (
                  <div className="card-nickname">
                    <i className="fa-solid fa-tag"></i>
                    <span>{card.card_nickname}</span>
                  </div>
                )}
                
                <div className="demo-label">DEMO CARD</div>
                
                <div className="card-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => startEdit(card)}
                  >
                    <i className="fa-solid fa-edit"></i>
                  </button>
                  {!card.is_default && (
                    <button 
                      className="action-btn default"
                      onClick={() => handleSetDefault(card.card_id)}
                    >
                      <i className="fa-solid fa-star"></i>
                    </button>
                  )}
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDelete(card.card_id)}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // Helper function to format card number
  function formatCardNumber(number) {
    return number.replace(/\d{4}(?=.)/g, '$& ');
  }
}