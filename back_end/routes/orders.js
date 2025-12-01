import express from "express";
import { authRequired } from "../middleware/auth.js";
import { adminRequired } from "../middleware/adminAuth.js";
import {getUserOrders, getAllOrders, getOrderById, updateOrderStatus, createOrderFromCart } from "../controllers/orderController.js";

const router = express.Router();

router.get("/user/:userId", authRequired, getUserOrders);
router.get("/:orderId", authRequired, getOrderById);
router.get("/", getAllOrders);
router.put("/:orderId/status", adminRequired, updateOrderStatus);
router.post("/from-cart", authRequired, createOrderFromCart);

export default router;