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

//create new tag
export const createTag = async (req, res) => {
  const { name, img_url } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Tag name is required" });
  }

  try {
    //check if tag already exists
    const exists = await db.query("SELECT 1 FROM tags WHERE name = $1", [name]);
    if (exists.rowCount > 0) {
      return res.status(400).json({ error: "Tag already exists" });
    }

    const result = await db.query(
      `INSERT INTO tags (name, img_url) 
       VALUES ($1, $2) 
       RETURNING tag_id AS id, name, img_url`,
      [name, img_url || null]
    );

    res.json({
      success: true,
      tag: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create tag" });
  }
};

//update tag
export const updateTag = async (req, res) => {
  const { id } = req.params;
  const { name, img_url } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Tag name is required" });
  }

  try {
    //check if tag exists
    const tagExists = await db.query("SELECT 1 FROM tags WHERE tag_id = $1", [id]);
    if (tagExists.rowCount === 0) {
      return res.status(404).json({ error: "Tag not found" });
    }

    //check if new name conflicts with existing tag
    const nameConflict = await db.query(
      "SELECT 1 FROM tags WHERE name = $1 AND tag_id != $2",
      [name, id]
    );
    if (nameConflict.rowCount > 0) {
      return res.status(400).json({ error: "Tag name already exists" });
    }

    const result = await db.query(
      `UPDATE tags 
       SET name = $1, img_url = $2 
       WHERE tag_id = $3 
       RETURNING tag_id AS id, name, img_url`,
      [name, img_url || null, id]
    );

    res.json({
      success: true,
      tag: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update tag" });
  }
};

//delete tag
export const deleteTag = async (req, res) => {
  const { id } = req.params;

  try {
    //check if tag exists
    const tagExists = await db.query("SELECT 1 FROM tags WHERE tag_id = $1", [id]);
    if (tagExists.rowCount === 0) {
      return res.status(404).json({ error: "Tag not found" });
    }

    //check if tag is used in restaurant_tags or item_tags
    const restaurantTags = await db.query(
      "SELECT 1 FROM restaurant_tags WHERE tag_id = $1 LIMIT 1",
      [id]
    );
    const itemTags = await db.query(
      "SELECT 1 FROM item_tags WHERE tag_id = $1 LIMIT 1",
      [id]
    );

    if (restaurantTags.rowCount > 0 || itemTags.rowCount > 0) {
      return res.status(400).json({ 
        error: "Cannot delete tag - it is currently in use",
        action: "in_use"
      });
    }

    await db.query("DELETE FROM tags WHERE tag_id = $1", [id]);

    res.json({ 
      success: true,
      action: "deleted",
      message: "Tag deleted successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete tag" });
  }
};