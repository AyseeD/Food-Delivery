import { useEffect, useState } from "react";
import "../styles/ItemModal.css";

export default function ItemModal({ itemId, onClose, onAdd }) {
  const [item, setItem] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    async function loadItem() {
      const res = await fetch(`http://localhost:4000/menu/item/${itemId}`);
      const data = await res.json();
      setItem(data);
    }
    loadItem();
  }, [itemId]);

  function toggleOption(optId) {
    setSelectedOptions((prev) =>
      prev.includes(optId)
        ? prev.filter((id) => id !== optId)
        : [...prev, optId]
    );
  }

  if (!item) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <button className="modal-close-btn" onClick={onClose}>✖</button>

        <img className="modal-img" src={item.image_url} alt={item.name} />

        <h2>{item.name}</h2>
        <p>{item.description}</p>
        <h3>Base Price: {item.price} ₺</h3>

        <h3>Extras</h3>
        <div className="options-list">
          {item.options?.map((opt) => (
            <label key={opt.option_id} className="option-item">
              <input id="modal-input"
                type="checkbox"
                checked={selectedOptions.includes(opt.option_id)}
                onChange={() => toggleOption(opt.option_id)}
              />
              {opt.name} (+{opt.additional_price} ₺)
            </label>
          ))}
        </div>

        <button
          className="modal-add-btn"
          onClick={() => onAdd(item, selectedOptions)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
