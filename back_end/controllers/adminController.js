import {db} from "../db.js";

export const getUsersAmount = async (req, res) => {
    try{
        const users = await db.query("SELECT * FROM users");
        res.json(users.rowCount);
    }catch (err) {
        console.error(err);
        res.status(500).json({ error: "Could not get user amount" });
    }
}

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

export const getRestaurantAmount = async (req, res) => {
    try{
        const restaurants = await db.query("SELECT * FROM restaurants");
        res.json(restaurants.rowCount);
    }catch (err){
        console.error(err);
        res.status(500).json({error: "Could not get restaurant amount"});
    }
}

export const getOrderAmount = async (req, res) => {
    try{
        const orders = await db.query("SELECT * FROM orders");
        res.json(orders.rowCount);
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Could not get order amount"});
    }
}

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Check if user has any orders
    const orders = await db.query(
      "SELECT 1 FROM orders WHERE user_id = $1 LIMIT 1",
      [id]
    );

    if (orders.rowCount > 0) {
      // Soft delete
      await db.query(
        "UPDATE users SET is_active = FALSE WHERE user_id = $1",
        [id]
      );

      return res.json({
        success: true,
        action: "deactivated",
        message: "User has orders. Deactivated instead of deleted.",
      });
    }

    // Hard delete
    const result = await db.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING user_id",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, action: "deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete user" });
  }
};
