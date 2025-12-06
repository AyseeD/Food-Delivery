import {db} from "../db.js";
import bcrypt from "bcrypt"; //for password hashing

//get number of users
export const getUsersAmount = async (req, res) => {
    try{
        const users = await db.query("SELECT * FROM users");
        res.json(users.rowCount);
    }catch (err) {
        console.error(err);
        res.status(500).json({ error: "Could not get user amount" });
    }
}

//create new user
export const createUser = async (req, res) => {
  const { full_name, email, password, address, role } = req.body;

  try {
    //if email exists warn the user
    const exists = await db.query("SELECT 1 FROM users WHERE email=$1", [email]);
    if (exists.rowCount > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10); //hash the new password
    const userRole = role || "customer"; //default role will be customer

    const result = await db.query(
      `INSERT INTO users (full_name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id AS id, full_name, email, role, is_active`,
      [full_name, email, hash, address || null, userRole]
    );

    res.json({
      success: true,
      user: result.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create user" });
  }
};

//get user information for users list
export const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        user_id AS id,
        full_name,
        email,
        role,
        is_active
      FROM users
      ORDER BY full_name ASC
    `);

    const users = result.rows;
    res.json(users);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not get users" });
  }
};

//get number of restaurants
export const getRestaurantAmount = async (req, res) => {
    try{
        const restaurants = await db.query("SELECT * FROM restaurants");
        res.json(restaurants.rowCount);
    }catch (err){
        console.error(err);
        res.status(500).json({error: "Could not get restaurant amount"});
    }
}

//get number of orders
export const getOrderAmount = async (req, res) => {
    try{
        const orders = await db.query("SELECT * FROM orders");
        res.json(orders.rowCount);
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Could not get order amount"});
    }
}

//delete existing user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    //check if user exists
    const userExists = await db.query(
      "SELECT 1 FROM users WHERE user_id = $1",
      [id]
    );

    if (userExists.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    //check for any related records that would prevent deletion
    const hasOrders = await db.query(
      "SELECT 1 FROM orders WHERE user_id = $1 LIMIT 1",
      [id]
    );

    const hasCart = await db.query(
      "SELECT 1 FROM cart WHERE user_id = $1 LIMIT 1",
      [id]
    );

    const hasDeliveries = await db.query(
      "SELECT 1 FROM deliveries WHERE driver_id = $1 LIMIT 1",
      [id]
    );

    //if user has any related records, deactivate instead of delete
    if (hasOrders.rowCount > 0 || hasCart.rowCount > 0 || hasDeliveries.rowCount > 0) {
      await db.query(
        "UPDATE users SET is_active = FALSE WHERE user_id = $1",
        [id]
      );

      return res.json({
        success: true,
        action: "deactivated",
        message: "User has related records. Deactivated instead of deleted.",
      });
    }

    //if no related records exist, proceed with hard delete
    const result = await db.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING user_id",
      [id]
    );

    res.json({ 
      success: true, 
      action: "deleted",
      message: "User permanently deleted" 
    });
  } catch (err) {
    console.error(err);
    
    if (err.code === '23503') { // Foreign key violation
      return res.status(400).json({ 
        error: "Cannot delete user due to existing references in other tables",
        hint: "User might have cart items or other related data"
      });
    }
    
    res.status(500).json({ error: "Could not delete user" });
  }
};

//get the menu items, options and tags for a specific restaurant for admins
export const getAllMenuByRestaurant = async (req,res) =>{
    const {restaurantId} = req.params;
    const itemsRes = await db.query(`
        SELECT mi.*, mc.name as category_name
        FROM menu_items mi
        LEFT JOIN menu_categories mc ON mi.category_id = mc.category_id
        WHERE mi.restaurant_id = $1
        ORDER BY mc.name NULLS LAST, mi.name
    `, [restaurantId]);

    const items = itemsRes.rows;

    //get options and tags for item id at the same time
    const itemIds = items.map(i => i.item_id);
    let optionsMap= {};
    let tagsMap = {};

    if (itemIds.length){
        const optionsRes = await db.query(`SELECT * FROM item_options WHERE item_id = ANY($1::int[])`, [itemIds]);
        optionsRes.rows.forEach(o => {
            optionsMap[o.item_id] = optionsMap[o.item_id] || [];
            optionsMap[o.item_id].push(o);
        });

        const tagsRes = await db.query(`
            SELECT it.item_id, t.tag_id, t.name
            FROM item_tags it JOIN tags t ON it.tag_id = t.tag_id
            WHERE it.item_id =  ANY($1::int[])
        `, [itemIds]);

        tagsRes.rows.forEach(r => {
            tagsMap[r.item_id] = tagsMap[r.item_id] || [];
            tagsMap[r.item_id].push({tag_id: r.tag_id, name: r.name});
        });
    }

    const enriched = items.map(i => ({
        ...i,
        options: optionsMap[i.item_id] || [],
        tags: tagsMap[i.item_id] || []
    }));

    res.json(enriched);
};