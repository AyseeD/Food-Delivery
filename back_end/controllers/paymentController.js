import { db } from "../db";

export const createPayment = async (req, res) =>{
    const {order_id, amount, method} = req.body;
    const result = await db.query(`
        INSERT INTO payments (order_id, amount, method, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING payment_id
    `, [order_id, amount, method]);

    res.json(result.rows[0]);
}