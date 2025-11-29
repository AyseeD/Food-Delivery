import { db } from "../db.js";

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { item_id, options = [] } = req.body;

    // Get or create cart
    let cartRes = await db.query(
      `SELECT cart_id FROM cart WHERE user_id = $1`,
      [userId]
    );

    let cartId;
    if (!cartRes.rows.length) {
      const newCart = await db.query(
        `INSERT INTO cart (user_id) VALUES ($1) RETURNING cart_id`,
        [userId]
      );
      cartId = newCart.rows[0].cart_id;
    } else {
      cartId = cartRes.rows[0].cart_id;
    }

    // Insert item
    const itemRes = await db.query(
      `INSERT INTO cart_items (cart_id, item_id, quantity, price_at_add)
       SELECT $1, item_id, 1, price
       FROM menu_items WHERE item_id = $2
       RETURNING cart_item_id`,
      [cartId, item_id]
    );

    const cartItemId = itemRes.rows[0].cart_item_id;

    // Insert options
    for (const optId of options) {
      await db.query(
        `INSERT INTO cart_item_options (cart_item_id, option_id)
         VALUES ($1, $2)`,
        [cartItemId, optId]
      );
    }

    res.json({ success: true, cart_item_id: cartItemId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not add to cart" });
  }
};