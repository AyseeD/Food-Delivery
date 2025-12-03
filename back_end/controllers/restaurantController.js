import {db} from "../db.js";

export const getAll = async (req, res) => {
  try {
    // For customers, only show active restaurants
    const isAdmin = req.user?.role === 'admin';
    const showAll = isAdmin || req.query.showAll === 'true';
    
    let query = `
      SELECT 
        r.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('tag_id', t.tag_id, 'name', t.name)
          ) FILTER (WHERE t.tag_id IS NOT NULL), 
          '[]'
        ) AS tags
      FROM restaurants r
      LEFT JOIN restaurant_tags rt ON r.restaurant_id = rt.restaurant_id
      LEFT JOIN tags t ON rt.tag_id = t.tag_id
    `;
    
    if (!showAll) {
      query += ` WHERE r.is_active = TRUE`;
    }
    
    query += ` GROUP BY r.restaurant_id`;
    
    const result = await db.query(query);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getById = async (req, res) => {
    const result = await db.query(
        "SELECT * FROM restaurants WHERE restaurant_id = $1", [req.params.id]
    );
    res.json(result.rows[0] || null);
};

export const getHours = async (req, res) => {
    const result = await db.query(
        "SELECT day_of_week, open_time, close_time FROM restaurant_hours WHERE restaurant_id = $1 ORDER BY day_of_week", 
        [req.params.id]
    );
    res.json(result.rows);
};

export const create = async (req, res) => {
  const { name, description, address, is_active, rating, restaurant_img, tags = [] } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO restaurants (name, description, address, is_active, rating, restaurant_img)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, address, is_active ?? true, rating ?? null, restaurant_img || null]
    );
    
    const restaurant = result.rows[0];
    
    // Add restaurant tags
    if (tags.length > 0) {
      for (const tagId of tags) {
        await db.query(
          "INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES ($1, $2)",
          [restaurant.restaurant_id, tagId]
        );
      }
    }
    
    // Get restaurant with tags for response
    const restaurantWithTags = await getRestaurantWithTags(restaurant.restaurant_id);
    
    res.json(restaurantWithTags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create restaurant" });
  }
};

export const update = async (req, res) => {
  const { name, description, address, is_active, rating, restaurant_img, tags = [] } = req.body;
  
  try {
    // Update restaurant
    const result = await db.query(
      `UPDATE restaurants 
       SET name=$1, description=$2, address=$3, is_active=$4, rating=$5, restaurant_img=$6
       WHERE restaurant_id=$7 RETURNING *`,
      [name, description, address, is_active, rating, restaurant_img || null, req.params.id]
    );
    
    const restaurant = result.rows[0];
    
    // Update restaurant tags
    await db.query("DELETE FROM restaurant_tags WHERE restaurant_id = $1", [req.params.id]);
    
    if (tags.length > 0) {
      for (const tagId of tags) {
        await db.query(
          "INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES ($1, $2)",
          [req.params.id, tagId]
        );
      }
    }
    
    // Get restaurant with tags for response
    const restaurantWithTags = await getRestaurantWithTags(req.params.id);
    
    res.json(restaurantWithTags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update restaurant" });
  }
};

// Helper function to get restaurant with tags
const getRestaurantWithTags = async (restaurantId) => {
  const result = await db.query(
    `SELECT 
      r.*,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('tag_id', t.tag_id, 'name', t.name)
        ) FILTER (WHERE t.tag_id IS NOT NULL), 
        '[]'
      ) AS tags
     FROM restaurants r
     LEFT JOIN restaurant_tags rt ON r.restaurant_id = rt.restaurant_id
     LEFT JOIN tags t ON rt.tag_id = t.tag_id
     WHERE r.restaurant_id = $1
     GROUP BY r.restaurant_id`,
    [restaurantId]
  );
  
  return result.rows[0];
};

export const remove = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if restaurant has any orders
    const ordersCheck = await db.query(
      "SELECT 1 FROM orders WHERE restaurant_id = $1 LIMIT 1",
      [id]
    );

    if (ordersCheck.rowCount > 0) {
      // Restaurant has orders, deactivate instead of deleting
      await db.query(
        "UPDATE restaurants SET is_active = FALSE WHERE restaurant_id = $1",
        [id]
      );

      return res.json({
        success: true,
        action: "deactivated",
        message: "Restaurant has orders. Deactivated instead of deleted.",
      });
    }

    // No orders, safe to delete
    // First delete related records due to foreign key constraints
    
    // Delete restaurant tags
    await db.query("DELETE FROM restaurant_tags WHERE restaurant_id = $1", [id]);
    
    // Delete restaurant hours
    await db.query("DELETE FROM restaurant_hours WHERE restaurant_id = $1", [id]);
    
    // Delete promotions
    await db.query("DELETE FROM promotions WHERE restaurant_id = $1", [id]);
    
    // For menu items, we need to handle their related records first
    // Get all menu item IDs for this restaurant
    const menuItemsRes = await db.query(
      "SELECT item_id FROM menu_items WHERE restaurant_id = $1",
      [id]
    );
    
    const itemIds = menuItemsRes.rows.map(row => row.item_id);
    
    if (itemIds.length > 0) {
      // Delete item tags
      await db.query("DELETE FROM item_tags WHERE item_id = ANY($1::int[])", [itemIds]);
      
      // Delete item options
      await db.query("DELETE FROM item_options WHERE item_id = ANY($1::int[])", [itemIds]);
      
      // Delete menu items
      await db.query("DELETE FROM menu_items WHERE restaurant_id = $1", [id]);
    }
    
    // Delete menu categories
    await db.query("DELETE FROM menu_categories WHERE restaurant_id = $1", [id]);
    
    // Finally delete the restaurant
    const result = await db.query(
      "DELETE FROM restaurants WHERE restaurant_id = $1 RETURNING restaurant_id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.json({ 
      success: true, 
      action: "deleted" 
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete restaurant" });
  }
};

export const search = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        error: "Search query must be at least 2 characters" 
      });
    }

    const searchQuery = `%${query}%`;

    // Simpler restaurants search
    const restaurantsRes = await db.query(
      `SELECT 
        r.restaurant_id,
        r.name,
        r.description,
        r.address,
        r.rating,
        r.restaurant_img,
        r.is_active
       FROM restaurants r
       WHERE (
         r.name ILIKE $1 
         OR r.description ILIKE $1
         OR EXISTS (
           SELECT 1 FROM restaurant_tags rt
           JOIN tags t ON rt.tag_id = t.tag_id
           WHERE rt.restaurant_id = r.restaurant_id
           AND t.name ILIKE $1
         )
       )
       AND r.is_active = TRUE
       ORDER BY r.name`,
      [searchQuery]
    );

    // Get tags for each restaurant separately
    const restaurants = restaurantsRes.rows;
    for (const restaurant of restaurants) {
      const tagsRes = await db.query(
        `SELECT t.tag_id, t.name
         FROM restaurant_tags rt
         JOIN tags t ON rt.tag_id = t.tag_id
         WHERE rt.restaurant_id = $1`,
        [restaurant.restaurant_id]
      );
      restaurant.tags = tagsRes.rows;
    }

    // Simpler menu items search
    const menuItemsRes = await db.query(
      `SELECT 
        mi.item_id,
        mi.name,
        mi.description,
        mi.price,
        mi.image_url,
        mi.is_available,
        r.restaurant_id,
        r.name AS restaurant_name,
        r.restaurant_img,
        mc.name AS category_name
       FROM menu_items mi
       JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
       LEFT JOIN menu_categories mc ON mi.category_id = mc.category_id
       WHERE (
         mi.name ILIKE $1 
         OR mi.description ILIKE $1
         OR EXISTS (
           SELECT 1 FROM item_tags it
           JOIN tags t ON it.tag_id = t.tag_id
           WHERE it.item_id = mi.item_id
           AND t.name ILIKE $1
         )
       )
       AND mi.is_available = TRUE
       AND r.is_active = TRUE
       ORDER BY mi.name`,
      [searchQuery]
    );

    // Get tags for each menu item separately
    const menuItems = menuItemsRes.rows;
    for (const item of menuItems) {
      const tagsRes = await db.query(
        `SELECT t.tag_id, t.name
         FROM item_tags it
         JOIN tags t ON it.tag_id = t.tag_id
         WHERE it.item_id = $1`,
        [item.item_id]
      );
      item.tags = tagsRes.rows;
    }

    res.json({
      restaurants,
      menuItems
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to perform search" });
  }
};