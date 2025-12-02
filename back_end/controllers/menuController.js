import {db} from "../db.js";

//return the categories, items, options, tags for a restaurant
export const getMenuByRestaurant = async (req, res) => {
    const { restaurantId } = req.params;
    const itemsRes = await db.query(`
        SELECT mi.*, mc.name as category_name
        FROM menu_items mi
        LEFT JOIN menu_categories mc ON mi.category_id = mc.category_id
        WHERE mi.restaurant_id = $1 
          AND mi.is_available = true  -- ADD THIS FILTER
        ORDER BY mc.name NULLS LAST, mi.name
    `, [restaurantId]);

    const items = itemsRes.rows;

    //get options and tags for item id at the same time
    const itemIds = items.map(i => i.item_id);
    let optionsMap = {};
    let tagsMap = {};

    if (itemIds.length) {
        const optionsRes = await db.query(`SELECT * FROM item_options WHERE item_id = ANY($1::int[])`, [itemIds]);
        optionsRes.rows.forEach(o => {
            optionsMap[o.item_id] = optionsMap[o.item_id] || [];
            optionsMap[o.item_id].push(o);
        });

        const tagsRes = await db.query(`
            SELECT it.item_id, t.tag_id, t.name
            FROM item_tags it JOIN tags t ON it.tag_id = t.tag_id
            WHERE it.item_id = ANY($1::int[])
        `, [itemIds]);

        tagsRes.rows.forEach(r => {
            tagsMap[r.item_id] = tagsMap[r.item_id] || [];
            tagsMap[r.item_id].push({ tag_id: r.tag_id, name: r.name });
        });
    }

    const enriched = items.map(i => ({
        ...i,
        options: optionsMap[i.item_id] || [],
        tags: tagsMap[i.item_id] || []
    }));

    res.json(enriched);
};

export const getItemById = async (req, res) =>{
    const {itemId} = req.params;
    const itemRes = await db.query(`SELECT * FROM menu_items WHERE item_id= $1`, [itemId]);
    const item = itemRes.rows[0];
    if(!item) return res.status(404).json({error:"Not found"});

    const optionRes = await db.query(`SELECT * FROM item_options WHERE item_id = $1`, [itemId]);
    const tagsRes =await db.query(`SELECT t.tag_id, t.name FROM item_tags it JOIN tags t ON it.tag_id = t.tag_id WHERE it.item_id = $1`, [itemId]);

    res.json({...item, options: optionRes.rows, tags: tagsRes.rows});
}

export const createItem = async (req, res) => {
  const { restaurant_id, category_id, name, description, price, image_url, is_available, options = [], tags = [] } = req.body;
  try {
    const itemRes = await db.query(
      `INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [restaurant_id, category_id, name, description, price, image_url, is_available ?? true]
    );
    const item = itemRes.rows[0];

    //insert options
    for (const opt of options) {
      await db.query(`INSERT INTO item_options (item_id, name, additional_price) VALUES ($1,$2,$3)`, [item.item_id, opt.name, opt.additional_price ?? 0]);
    }

    //ensure tags exist then link them
    for (const tagName of tags) {
      let tagRes = await db.query(`SELECT tag_id FROM tags WHERE name = $1`, [tagName]);
      let tagId;
      if (tagRes.rows.length) {
        tagId = tagRes.rows[0].tag_id;
      } else {
        const ins = await db.query(`INSERT INTO tags (name) VALUES ($1) RETURNING tag_id`, [tagName]);
        tagId = ins.rows[0].tag_id;
      }
      await db.query(`INSERT INTO item_tags (item_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [item.item_id, tagId]);
    }

    res.json({ item_id: item.item_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create item" });
  }
};

export const getTags = async (req, res) => {
  const r = await db.query("SELECT * FROM tags ORDER BY name");
  res.json(r.rows);
};

// Get categories by restaurant
export const getCategoriesByRestaurant = async (req, res) => {
  const { restaurantId } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM menu_categories WHERE restaurant_id = $1 ORDER BY name",
      [restaurantId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch categories" });
  }
};

// Update menu item
export const updateItem = async (req, res) => {
  const { itemId } = req.params;
  const { name, description, price, image_url, category_id, is_available, tags } = req.body;
  
  try {
    // Update item
    const result = await db.query(
      `UPDATE menu_items 
       SET name=$1, description=$2, price=$3, image_url=$4, category_id=$5, is_available=$6 
       WHERE item_id=$7 RETURNING *`,
      [name, description, price, image_url, category_id, is_available, itemId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    // Update tags
    await db.query("DELETE FROM item_tags WHERE item_id = $1", [itemId]);
    
    for (const tagName of tags) {
      let tagRes = await db.query("SELECT tag_id FROM tags WHERE name = $1", [tagName]);
      let tagId;
      if (tagRes.rows.length) {
        tagId = tagRes.rows[0].tag_id;
      } else {
        const ins = await db.query("INSERT INTO tags (name) VALUES ($1) RETURNING tag_id", [tagName]);
        tagId = ins.rows[0].tag_id;
      }
      await db.query(
        "INSERT INTO item_tags (item_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [itemId, tagId]
      );
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update item" });
  }
};

// Delete menu item
export const deleteItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    await db.query("DELETE FROM menu_items WHERE item_id = $1", [itemId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete item" });
  }
};

// Update item availability
export const updateItemAvailability = async (req, res) => {
  const { itemId } = req.params;
  const { is_available } = req.body;
  try {
    const result = await db.query(
      "UPDATE menu_items SET is_available = $1 WHERE item_id = $2 RETURNING *",
      [is_available, itemId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update availability" });
  }
};