import { db } from "../db.js";

export const createOrder = async (req, res) => {
  const { user_id, restaurant_id, total_amount, delivery_address, items = [], promo_code } = req.body;

  if (!items.length) return res.status(400).json({ error: "No items" });

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const orderRes = await client.query(
      `INSERT INTO orders (user_id, restaurant_id, total_amount, delivery_address) VALUES ($1,$2,$3,$4) RETURNING order_id`,
      [user_id, restaurant_id, total_amount, delivery_address]
    );
    const orderId = orderRes.rows[0].order_id;

    //insert order items
    for (const it of items) {
      const oiRes = await client.query(
        `INSERT INTO order_items (order_id, item_id, quantity, price_at_purchase) VALUES ($1,$2,$3,$4) RETURNING order_item_id`,
        [orderId, it.item_id, it.quantity, it.price]
      );
      const orderItemId = oiRes.rows[0].order_item_id;

      //insert options for that order_item
      if (it.options && it.options.length) {
        for (const optId of it.options) {
          await client.query(`INSERT INTO order_item_options (order_item_id, option_id) VALUES ($1,$2)`, [orderItemId, optId]);
        }
      }
    }

    // If promo_code exits, try to apply it
    if (promo_code) {
      const promoRes = await client.query(`SELECT promo_id, discount_percent, valid_from, valid_until, is_active FROM promotions WHERE code = $1`, [promo_code]);
      if (promoRes.rows[0]) {
        const promo = promoRes.rows[0];
        const now = new Date();
        if (promo.is_active && (!promo.valid_from || new Date(promo.valid_from) <= now) && (!promo.valid_until || new Date(promo.valid_until) >= now)) {
          await client.query(`INSERT INTO orders_promotions (order_id, promo_id) VALUES ($1,$2)`, [orderId, promo.promo_id]);
        }
      }
    }

    await client.query("COMMIT");
    res.json({ order_id: orderId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Could not create order" });
  } finally {
    client.release();
  }
};

export const getUserOrders = async (req, res) => {
  const { userId } = req.params;
  const result = await db.query("SELECT * FROM orders WHERE user_id = $1 ORDER BY placed_at DESC", [userId]);
  res.json(result.rows);
};

export const getOrderById = async (req, res) => {
  const { orderId } = req.params;
  const orderRes = await db.query("SELECT * FROM orders WHERE order_id = $1", [orderId]);
  const itemsRes = await db.query(`SELECT oi.*, mi.name FROM order_items oi JOIN menu_items mi ON oi.item_id = mi.item_id WHERE oi.order_id = $1`, [orderId]);
  const tracking = await db.query("SELECT * FROM delivery_tracking WHERE order_id = $1 ORDER BY recorded_at DESC LIMIT 10", [orderId]);
  res.json({ order: orderRes.rows[0], items: itemsRes.rows, tracking: tracking.rows });
};

export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const allowed = ['pending','accepted','preparing','picked_up','delivering','delivered','cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });
  await db.query("UPDATE orders SET status=$1, updated_at=NOW() WHERE order_id=$2", [status, orderId]);
  res.json({ ok: true });
};
