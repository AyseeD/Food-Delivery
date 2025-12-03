import { db } from "../db.js";

export const getUserOrders = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await db.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY placed_at DESC",
      [userId]
    );
    
    // Get items for each order
    const orders = result.rows;
    
    for (const order of orders) {
      const itemsRes = await db.query(
        `SELECT oi.*, mi.name, mi.image_url
         FROM order_items oi
         JOIN menu_items mi ON oi.item_id = mi.item_id
         WHERE oi.order_id = $1`,
        [order.order_id]
      );
      
      order.items = itemsRes.rows;
    }
    
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not get user orders" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        o.order_id AS id,
        o.total_amount AS total,
        o.status,
        o.placed_at AS date,
        u.full_name AS user,
        r.name AS restaurant
      FROM orders o
      JOIN users u ON u.user_id = o.user_id
      JOIN restaurants r ON r.restaurant_id = o.restaurant_id
      ORDER BY o.placed_at DESC
    `);

    // load items for each order WITH QUANTITIES
    const orders = result.rows;

    for (const order of orders) {
      const itemsRes = await db.query(
        `
        SELECT mi.name, oi.quantity, oi.price_at_purchase
        FROM order_items oi
        JOIN menu_items mi ON mi.item_id = oi.item_id
        WHERE oi.order_id = $1
        `,
        [order.id]
      );

      // Format items with quantity
      order.items = itemsRes.rows.map(r => ({
        name: r.name,
        quantity: r.quantity,
        price: r.price_at_purchase,
        itemTotal: (r.price_at_purchase * r.quantity).toFixed(2)
      }));
    }

    res.json(orders);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not get orders" });
  }
};


export const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  const orderRes = await db.query(
    "SELECT * FROM orders WHERE order_id = $1",
    [orderId]
  );

  const itemsRes = await db.query(
    `SELECT 
      oi.*, 
      mi.name,
      mi.image_url,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'option_id', io.option_id,
            'name', io.name,
            'additional_price', io.additional_price
          )
        ) FILTER (WHERE io.option_id IS NOT NULL),
        '[]'
      ) AS options
     FROM order_items oi
     JOIN menu_items mi ON oi.item_id = mi.item_id
     LEFT JOIN order_item_options oio ON oi.order_item_id = oio.order_item_id
     LEFT JOIN item_options io ON oio.option_id = io.option_id
     WHERE oi.order_id = $1
     GROUP BY oi.order_item_id, mi.name, mi.image_url
     ORDER BY oi.order_item_id`,
    [orderId]
  );

  const deliveryRes = await db.query(
    `SELECT d.*, u.full_name AS driver_name
     FROM deliveries d
     JOIN users u ON u.user_id = d.driver_id
     WHERE order_id = $1`,
    [orderId]
  );

  // Get promotion info
  const promoRes = await db.query(
    `SELECT p.*
     FROM orders_promotions op
     JOIN promotions p ON op.promo_id = p.promo_id
     WHERE op.order_id = $1`,
    [orderId]
  );

  res.json({
    order: orderRes.rows[0],
    items: itemsRes.rows,
    delivery: deliveryRes.rows[0],
    promotion: promoRes.rows[0] || null
  });
};

export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const allowed = ['pending','accepted','preparing','picked_up','delivering','delivered','cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });
  await db.query("UPDATE orders SET status=$1, updated_at=NOW() WHERE order_id=$2", [status, orderId]);
  await db.query(
    `UPDATE deliveries 
    SET status = $1, updated_at = NOW()
    WHERE order_id = $2`,
    [status, orderId]
  );

  res.json({ ok: true });
};

export const createOrderFromCart = async (req, res) => {
  const userId = req.user.user_id;
  const { promo_code } = req.body;

  const client = await db.connect();

  try {
    // Get cart ID
    const cartRes = await client.query(
      `SELECT cart_id FROM cart WHERE user_id = $1`,
      [userId]
    );

    if (!cartRes.rows.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const cartId = cartRes.rows[0].cart_id;

    // Get items in cart
    const itemsRes = await client.query(
      `SELECT ci.cart_item_id, ci.item_id, ci.quantity, ci.price_at_add,
              mi.restaurant_id,
              COALESCE(json_agg(cio.option_id) FILTER (WHERE cio.option_id IS NOT NULL), '[]') AS options
       FROM cart_items ci
       JOIN menu_items mi ON ci.item_id = mi.item_id
       LEFT JOIN cart_item_options cio ON ci.cart_item_id = cio.cart_item_id
       WHERE ci.cart_id = $1
       GROUP BY ci.cart_item_id, ci.quantity, mi.restaurant_id`,
      [cartId]
    );

    if (!itemsRes.rows.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const items = itemsRes.rows;
    const restaurantId = items[0].restaurant_id;

    // Calculate subtotal PROPERLY - MULTIPLY BY QUANTITY
    let subtotal = 0;
    for (const it of items) {
      // Multiply base price by quantity
      subtotal += Number(it.price_at_add) * it.quantity;

      // Add option prices - also multiply by quantity
      if (it.options && it.options.length) {
        const optPrices = await client.query(
          `SELECT SUM(additional_price) AS sum FROM item_options WHERE option_id = ANY($1::int[])`,
          [it.options]
        );
        const optionsTotal = Number(optPrices.rows[0].sum || 0);
        subtotal += optionsTotal * it.quantity;
      }
    }

    // Apply promotion if provided
    let discountAmount = 0;
    let appliedPromoId = null;
    
    if (promo_code) {
      const promoRes = await client.query(
        `SELECT * FROM promotions 
         WHERE code = $1 
           AND restaurant_id = $2 
           AND is_active = TRUE
           AND valid_from <= CURRENT_DATE
           AND valid_until >= CURRENT_DATE`,
        [promo_code.toUpperCase(), restaurantId]
      );

      if (promoRes.rows.length > 0) {
        const promotion = promoRes.rows[0];
        appliedPromoId = promotion.promo_id;
        discountAmount = (subtotal * promotion.discount_percent) / 100;
      } else {
        return res.status(400).json({ error: "Invalid or expired promo code" });
      }
    }

    const totalAmount = subtotal - discountAmount;

    // Get user address
    const addrRes = await client.query(
      `SELECT address FROM users WHERE user_id = $1`,
      [userId]
    );

    const address = addrRes.rows[0].address || "Unknown address";

    // Begin transaction
    await client.query("BEGIN");

    // 1. Create order
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, restaurant_id, total_amount, delivery_address)
       VALUES ($1, $2, $3, $4)
       RETURNING order_id`,
      [userId, restaurantId, totalAmount, address]
    );

    const orderId = orderRes.rows[0].order_id;

    // 2. Apply promotion to order if exists
    if (appliedPromoId) {
      await client.query(
        `INSERT INTO orders_promotions (order_id, promo_id)
         VALUES ($1, $2)`,
        [orderId, appliedPromoId]
      );
    }

    // 3. Insert order_items WITH QUANTITY
    for (const it of items) {
      const oiRes = await client.query(
        `INSERT INTO order_items (order_id, item_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)
         RETURNING order_item_id`,
        [orderId, it.item_id, it.quantity, it.price_at_add]
      );

      const orderItemId = oiRes.rows[0].order_item_id;

      // Insert options
      for (const optId of it.options) {
        await client.query(
          `INSERT INTO order_item_options (order_item_id, option_id)
           VALUES ($1, $2)`,
          [orderItemId, optId]
        );
      }
    }

    // 4. Clear cart
    await client.query(
      `DELETE FROM cart_item_options WHERE cart_item_id IN 
         (SELECT cart_item_id FROM cart_items WHERE cart_id = $1)`,
      [cartId]
    );

    await client.query(
      `DELETE FROM cart_items WHERE cart_id = $1`,
      [cartId]
    );

    // 5. Assign driver
    const driverRes = await client.query(
      `SELECT user_id, full_name FROM users
       WHERE role = 'driver'
       ORDER BY RANDOM()
       LIMIT 1`
    );

    if (driverRes.rows.length === 0) {
      throw new Error("No available drivers");
    }

    const driverId = driverRes.rows[0].user_id;

    await client.query(
      `INSERT INTO deliveries (order_id, driver_id)
       VALUES ($1, $2)`,
      [orderId, driverId]
    );

    await client.query("COMMIT");

    res.json({ 
      success: true, 
      order_id: orderId,
      total_amount: totalAmount,
      discount_applied: discountAmount,
      subtotal: subtotal
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Could not create order from cart" });
  } finally {
    client.release();
  }
};