import {db} from "../db.js";

export const getRestaurants = async (req, res) =>{
    const result = await db.query("SELECT * FROM restaurants WHERE is_active = true");
    res.json(result.rows);
}

export const getRestaurantById = async (req, res) => {
    const result = await db.query(
        "SELECT * FROM restaurants WHERE restaurant_id = $1", [req.params.id]
    );
    res.json(result.rows[0]);
}