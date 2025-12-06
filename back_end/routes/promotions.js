import express from "express";
import { 
  getPromotionsByRestaurant, 
  createPromotion, 
  applyPromotion,
  updatePromotion 
} from "../controllers/promoController.js";
import { authRequired } from "../middleware/auth.js";
import { adminRequired } from "../middleware/adminAuth.js";

const router = express.Router();

//public promotion routes
router.get("/restaurant/:restaurantId", getPromotionsByRestaurant);
router.post("/apply", authRequired, applyPromotion);

//admin promotion routes
router.post("/", authRequired, adminRequired, createPromotion);
router.patch("/:promoId", authRequired, adminRequired, updatePromotion);

export default router;