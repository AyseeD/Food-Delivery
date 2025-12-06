import { db } from "../db.js";

//get all tags
export const getAll = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM tags ORDER BY tag_id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Tag query error:", err);
    res.status(500).json({ error: "Server error loading tags" });
  }
};

//get tags of restaurant
export const getRestaurantTags = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM tags ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Restaurant tag query error:", err);
    res.status(500).json({ error: "Server error loading restaurant tags" });
  }
};