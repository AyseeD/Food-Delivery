import {db} from "../db.js";
import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const restaurants = await db.query(
      `SELECT restaurant_id, name, description, rating, image_url 
       FROM restaurants 
       WHERE is_active = TRUE`
    );

    const categories = await db.query(`
      SELECT DISTINCT name FROM tags ORDER BY name ASC;
    `);

    res.json({
      restaurants: restaurants.rows,
      categories: categories.rows.map(c => c.name)
    });

  } catch (err) {
    console.error("HOME FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to load home page data" });
  }
});

export default router;
