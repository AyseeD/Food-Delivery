import { useEffect, useState } from "react";

export default function OrderCard({ order, token }) {
    const [restaurant, setRestaurant] = useState(null);
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [delivery, setDelivery] = useState(null);

    useEffect(() => {
        async function loadRestaurant() {
            const res = await fetch(`http://localhost:4000/restaurants/${order.restaurant_id}`);
            const data = await res.json();
            setRestaurant(data);
        }
        loadRestaurant();
    }, [order.restaurant_id]);

    async function loadOrderItems() {
        if (items.length > 0) return;

        const res = await fetch(`http://localhost:4000/orders/${order.order_id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setItems(data.items || []);
        setDelivery(data.delivery || null);
    }

    function toggleOpen() {
        if (!open) loadOrderItems();
        setOpen((prev) => !prev);
    }

    function handleButtonClick(e) {
        e.stopPropagation();
        toggleOpen();
    }

    return (
        <div className="order-card" onClick={toggleOpen}>
            <div className="order-card-left">
                <p className="order-restaurant">
                    {restaurant ? restaurant.name : "Loading restaurant..."}
                </p>

                <span className={`status-badge ${order.status}`}>
                    {order.status}
                </span>

                <p>{new Date(order.placed_at).toLocaleString()}</p>
            </div>

            <div className="order-card-right">
                <p className="order-price">{order.total_amount} ₺</p>

                {/* 🔥 Button now works */}
                <button className="expand-btn" onClick={handleButtonClick}>
                    {open ? "▲" : "▼"}
                </button>
            </div>

            {open && (
                <div className="order-details">
                    {items.map((it) => (
                        <div key={it.order_item_id} className="order-item-row">
                            <p>
                                <strong>{it.name}</strong> × {it.quantity}
                            </p>

                            {it.options?.length > 0 && (
                                <ul className="order-item-options">
                                    {it.options.map((op) => (
                                        <li key={op.option_id}>+ {op.option_name}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}

                    {delivery && (
                        <div className="delivery-info">
                            <p><strong>Driver:</strong> {delivery.driver_name}</p>
                            <p><strong>Delivery Status:</strong> {delivery.status}</p>
                            <p><strong>Assigned At:</strong>
                                {delivery.assigned_at
                                    ? new Date(delivery.assigned_at).toLocaleString()
                                    : "Unknown"}
                            </p>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
