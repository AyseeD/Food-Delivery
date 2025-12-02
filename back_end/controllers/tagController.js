import { db } from "../db.js";

export const getAll = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM tags ORDER BY tag_id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Tag query error:", err);
    res.status(500).json({ error: "Server error loading tags" });
  }
};

export const getRestaurantTags = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM tags ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Restaurant tag query error:", err);
    res.status(500).json({ error: "Server error loading restaurant tags" });
  }
};