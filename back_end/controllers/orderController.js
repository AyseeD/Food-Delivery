import { db } from "../db";

export const createOrder = async (req, res) =>{
    const {user_id, restaurant_id, total_amount, delivery_address, items} = req.body;

    const order = await db.query(`
        INSERT INTO orders (user_id, restaurant_id, total_amount, delivery_address)
        VALUES ($1, $2, $3, $4)
        RETURNING order_id
    `, [user_id, restaurant_id, total_amount, delivery_address]);

    const orderId = order.rows[0].order_id;
    for (const i of items){
        await db.query(`
            INSERT INTO order_items (order_id, item_id, quantity, price_at_purchace)
            VALUES ($1, $2, $3, $4)
        `, [orderId, i.item_id, i.quantity, i.price]);
    }

    res.json({order_id: orderId});
};

export const getUserOrders = async (req, res) => {
    const { userId } = req.params;
    const orders = await db.query(
        "SELECT * FROM orders WHERE user_id = $1 ORDER BY placed_at DESC",
        [userId]
    );
    res.json(orders.rows);
};