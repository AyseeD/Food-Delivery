import { db } from "../db.js";

//Creates a payment record in DB (status = pending).
// frontend should use returned payment_id

export const createPaymentRecord = async (req, res) => {
  const { order_id, amount, method } = req.body;
  if (!order_id || !amount || !method) return res.status(400).json({ error: "Missing fields" });

  const r = await db.query(`INSERT INTO payments (order_id, amount, method, status) VALUES ($1,$2,$3,'pending') RETURNING payment_id`, [order_id, amount, method]);
  res.json({ payment_id: r.rows[0].payment_id });
};

export const confirmPayment = async (req, res) => {
  const { payment_id, status, transaction_id } = req.body;
  if (!payment_id) return res.status(400).json({ error: "Missing payment_id" });

  await db.query(`UPDATE payments SET status=$1, transaction_id=$2, paid_at=CASE WHEN $1 = 'paid' THEN NOW() ELSE NULL END WHERE payment_id=$3`, [status, transaction_id || null, payment_id]);
  res.json({ ok: true });
};
