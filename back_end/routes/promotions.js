import express from "express";
import { getPromotionsByRestaurant, createPromotion } from "../controllers/promoController.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/restaurant/:restaurantId", getPromotionsByRestaurant);
router.post("/", authRequired, requireRole("system_admin"), createPromotion);

export default router;
