import { db } from "../db.js";

//add items to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { item_id, options = [], quantity = 1 } = req.body; // Add quantity default

    //get or create cart for that specific user
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

    //check if item already exists in cart
    const existingItem = await db.query(
      `SELECT ci.cart_item_id, ci.quantity 
       FROM cart_items ci
       JOIN cart c ON ci.cart_id = c.cart_id
       WHERE c.user_id = $1 AND ci.item_id = $2`,
      [userId, item_id]
    );

    //if item exists, update quantity
    if (existingItem.rows.length > 0) {
      const newQuantity = existingItem.rows[0].quantity + quantity;
      const cartItemId = existingItem.rows[0].cart_item_id;
      
      await db.query(
        `UPDATE cart_items SET quantity = $1 WHERE cart_item_id = $2`,
        [newQuantity, cartItemId]
      );
      
      return res.json({ 
        success: true, 
        cart_item_id: cartItemId,
        updated_quantity: newQuantity 
      });
    }

    //insert new item with quantity
    const itemRes = await db.query(
      `INSERT INTO cart_items (cart_id, item_id, quantity, price_at_add)
       SELECT $1, item_id, $2, price
       FROM menu_items WHERE item_id = $3
       RETURNING cart_item_id`,
      [cartId, quantity, item_id] //use quantity parameter
    );

    const cartItemId = itemRes.rows[0].cart_item_id;

    //insert extra item options
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

//get cart information
export const getCart = async (req, res) => {
  try {
    const userId = req.user.user_id;

    //find user's cart
    const cart = await db.query(
      `SELECT cart_id FROM cart WHERE user_id = $1`,
      [userId]
    );

    if (!cart.rows.length) {
      return res.json({ items: [] });
    }

    const cartId = cart.rows[0].cart_id;

    //load cart items and options
    const items = await db.query(
      `SELECT 
        ci.cart_item_id, 
        ci.quantity, 
        ci.price_at_add,
        ci.item_id,
        mi.name, 
        mi.image_url,
        mi.restaurant_id,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'option_id', o.option_id,
              'name', o.name,
              'additional_price', o.additional_price
            )
          ) FILTER (WHERE o.option_id IS NOT NULL),
          '[]'
        ) AS options
       FROM cart_items ci
       JOIN menu_items mi ON ci.item_id = mi.item_id
       LEFT JOIN cart_item_options cio ON ci.cart_item_id = cio.cart_item_id
       LEFT JOIN item_options o ON cio.option_id = o.option_id
       WHERE ci.cart_id = $1
       GROUP BY 
         ci.cart_item_id, 
         ci.item_id,
         mi.name, 
         mi.image_url,
         mi.restaurant_id
       ORDER BY ci.cart_item_id DESC`,
      [cartId]
    );

    res.json({ items: items.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch cart" });
  }
};

//delete added cart item
export const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { cart_item_id } = req.params;

    //make sure the item belongs to the user's cart
    const check = await db.query(
      `SELECT ci.cart_item_id
       FROM cart_items ci
       JOIN cart c ON ci.cart_id = c.cart_id
       WHERE ci.cart_item_id = $1 AND c.user_id = $2`,
      [cart_item_id, userId]
    );

    if (!check.rows.length) {
      return res.status(404).json({ error: "Item not found in your cart" });
    }

    //delete options first for foreign key constraint
    await db.query(
      `DELETE FROM cart_item_options WHERE cart_item_id = $1`,
      [cart_item_id]
    );

    //delete the cart item
    await db.query(
      `DELETE FROM cart_items WHERE cart_item_id = $1`,
      [cart_item_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete cart item" });
  }
};

//update the quantity of a cart item
export const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    //item must belong to the user's cart
    const check = await db.query(
      `SELECT ci.cart_item_id
       FROM cart_items ci
       JOIN cart c ON ci.cart_id = c.cart_id
       WHERE ci.cart_item_id = $1 AND c.user_id = $2`,
      [cartItemId, userId]
    );

    if (!check.rows.length) {
      return res.status(404).json({ error: "Item not found in your cart" });
    }

    //update quantity
    const result = await db.query(
      `UPDATE cart_items 
       SET quantity = $1
       WHERE cart_item_id = $2
       RETURNING *`,
      [quantity, cartItemId]
    );

    res.json({ success: true, cartItem: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update quantity" });
  }
};