import express from "express";
import { authRequired } from "../middleware/auth.js";
import { createOrder, getUserOrders, getOrderById, updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", authRequired, createOrder);
router.get("/user/:userId", authRequired, getUserOrders);
router.get("/:orderId", authRequired, getOrderById);
router.put("/:orderId/status", authRequired, updateOrderStatus);

export default router;