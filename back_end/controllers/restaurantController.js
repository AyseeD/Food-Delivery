import {db} from "../db.js";

export const getAll = async (req, res) =>{
    try {
    const result = await db.query(`
      SELECT r.*,
        COALESCE(JSON_AGG(t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags
      FROM restaurants r
      LEFT JOIN restaurant_tags rt ON r.restaurant_id = rt.restaurant_id
      LEFT JOIN tags t ON rt.tag_id = t.tag_id
      GROUP BY r.restaurant_id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getById = async (req, res) => {
    const result = await db.query(
        "SELECT * FROM restaurants WHERE restaurant_id = $1", [req.params.id]
    );
    res.json(result.rows[0] || null);
};

export const getHours = async (req, res) => {
    const result = await db.query("SELECT day_of_week, open_time, close_time, FROM restaurant_hours WHERE restaurant_id = $1 ORDER BY day_of_week", [req.params.id]);
    res.json(result.rows);
};

export const create = async (req, res)=> {
    const {name, description, address, is_active, rating} = req.body;
    const result = await db.query(`INSERT INTO restaurants (name, description, address, is_active, rating)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`, [name, description,address,is_active ?? true, rating ?? null]);
    res.json(result.rows[0]);
};

export const update = async (req, res) => {
    const {name,description,address,is_active,rating} = req.body;
    const result = await db.query(`UPDATE restaurants SET name=$1, description=$2, address=$3, is_active=$4, rating=$5, created_at = created_at WHERE restaurant_id=$6 RETURNING *`,
        [name, description, address, is_active, rating, req.params.id]
    );
    res.json(result.rows[0]);
};

export const remove = async (req, res) =>{
    await db.query("DELETE FROM restaurants WHERE restaurant_id = $1", [req.params.id]);
    res.json({deleted: true});
};