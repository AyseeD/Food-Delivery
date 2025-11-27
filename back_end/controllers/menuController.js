import {db} from "../db.js";

export const getMenuByRestaurant = async (req,res) =>{
    const {restaurantId} = req.params;
    const menu = await db.query(`
        SELECT mi.*, mc.name AS category_name
        FROM menu_items mi
        JOIN menu_categories mc ON mi.category_id = mc.category_id
        WHERE mi.restaurant_id = $1
    `, [restaurantId]);

    res.json(menu.rows);
};

export const getItem = async (req, res) =>{
    const {itemId} = req.params;
    const item = await db.query(`SELECT * FROM menu_items WHERE item_id= $1`, [itemId]);

    res.json(item.rows[0]);
}