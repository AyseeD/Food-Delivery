import { checkAndUpdateDeliveringOrders } from "./controllers/deliveryController.js";

//checks the deliveries
export async function runDeliveryCheck() {
  try {
    const updatedCount = await checkAndUpdateDeliveringOrders();
    if (updatedCount > 0) {
      console.log(`Automatically delivered ${updatedCount} order(s)`);
    }
  } catch (error) {
    console.error("Delivery check failed:", error);
  }
}

//runs the delivery checking method every 10 seconds
export function startDeliveryScheduler() {
  console.log("Starting delivery scheduler...");
  
  //run immediately on startup
  runDeliveryCheck();
  
  //run every 10 seconds
  const interval = setInterval(runDeliveryCheck, 10000);
  
  global.deliveryInterval = interval;
  
  return interval;
}