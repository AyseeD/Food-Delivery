import express from "express";
import { authRequired } from "../middleware/auth.js";
import {getUserOrders, getOrderById, updateOrderStatus, createOrderFromCart } from "../controllers/orderController.js";

const router = express.Router();

router.get("/user/:userId", authRequired, getUserOrders);
router.get("/:orderId", authRequired, getOrderById);
router.put("/:orderId/status", authRequired, updateOrderStatus);
router.post("/from-cart", authRequired, createOrderFromCart);

export default router;