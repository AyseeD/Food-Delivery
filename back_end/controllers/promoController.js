import { db } from "../db.js";

export const getPromotionsByRestaurant = async (req, res) => {
  const { restaurantId } = req.params;
  const r = await db.query("SELECT * FROM promotions WHERE restaurant_id = $1 AND is_active = true", [restaurantId]);
  res.json(r.rows);
};

export const createPromotion = async (req, res) => {
  const { restaurant_id, code, description, discount_percent, valid_from, valid_until } = req.body;
  const r = await db.query(`INSERT INTO promotions (restaurant_id, code, description, discount_percent, valid_from, valid_until, is_active) VALUES ($1,$2,$3,$4,$5,$6,true) RETURNING *`, [restaurant_id, code, description, discount_percent, valid_from, valid_until]);
  res.json(r.rows[0]);
};
