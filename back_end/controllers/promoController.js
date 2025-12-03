import { db } from "../db.js";

export const applyPromotion = async (req, res) => {
  const { promo_code, restaurant_id } = req.body;
  
  try {
    // Check if promo code exists and is valid
    const promoRes = await db.query(
      `SELECT * FROM promotions 
       WHERE code = $1 
         AND restaurant_id = $2 
         AND is_active = TRUE
         AND valid_from <= CURRENT_DATE
         AND valid_until >= CURRENT_DATE`,
      [promo_code.toUpperCase(), restaurant_id]
    );

    if (promoRes.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired promo code" });
    }

    const promotion = promoRes.rows[0];
    
    res.json({
      success: true,
      promotion: {
        code: promotion.code,
        description: promotion.description,
        discount_percent: promotion.discount_percent,
        valid_until: promotion.valid_until
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to apply promotion" });
  }
};

export const getPromotionsByRestaurant = async (req, res) => {
  const { restaurantId } = req.params;
  
  try {
    const result = await db.query(
      `SELECT * FROM promotions 
       WHERE restaurant_id = $1 
         AND is_active = TRUE
         AND valid_from <= CURRENT_DATE
         AND valid_until >= CURRENT_DATE
       ORDER BY discount_percent DESC`,
      [restaurantId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch promotions" });
  }
};

export const createPromotion = async (req, res) => {
  const { restaurant_id, code, description, discount_percent, valid_from, valid_until } = req.body;
  
  try {
    // Check if code already exists
    const existing = await db.query(
      "SELECT 1 FROM promotions WHERE code = $1",
      [code.toUpperCase()]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Promo code already exists" });
    }
    
    const result = await db.query(
      `INSERT INTO promotions 
       (restaurant_id, code, description, discount_percent, valid_from, valid_until, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       RETURNING *`,
      [restaurant_id, code.toUpperCase(), description, discount_percent, valid_from, valid_until]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create promotion" });
  }
};

export const updatePromotion = async (req, res) => {
  const { promoId } = req.params;
  const { is_active } = req.body;
  
  try {
    // Verify promotion exists and belongs to admin's restaurant
    const promoCheck = await db.query(
      "SELECT restaurant_id FROM promotions WHERE promo_id = $1",
      [promoId]
    );
    
    if (promoCheck.rows.length === 0) {
      return res.status(404).json({ error: "Promotion not found" });
    }
    
    const result = await db.query(
      `UPDATE promotions 
       SET is_active = $1
       WHERE promo_id = $2
       RETURNING *`,
      [is_active, promoId]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update promotion" });
  }
};