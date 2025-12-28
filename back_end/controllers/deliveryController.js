import {db} from "../db.js";

//chech if an order has been delivering status for at least 30 seconds
export const checkAndUpdateDeliveringOrders = async () => {
  try {
    const deliveringOrders = await db.query(
      `SELECT order_id, updated_at 
       FROM orders 
       WHERE status = 'delivering' 
         AND updated_at <= NOW() - INTERVAL '10 seconds'`
    );
    
    //if an order has been "delivering" 30 seconds then change it to delivered.
    for (const order of deliveringOrders.rows) {
      await db.query(
        "UPDATE orders SET status = 'delivered', updated_at = NOW() WHERE order_id = $1",
        [order.order_id]
      );
      
      await db.query(
        `UPDATE deliveries 
         SET status = 'delivered', updated_at = NOW()
         WHERE order_id = $1`,
        [order.order_id]
      );
      
      console.log(`Order ${order.order_id} marked as delivered`);
    }
    
    return deliveringOrders.rows.length;
  } catch (err) {
    console.error("Error in checkAndUpdateDeliveringOrders:", err);
    return 0;
  }
};