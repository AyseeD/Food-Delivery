import express from "express";
import { authRequired } from "../middleware/auth.js";
import { addToCart, getCart } from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", authRequired, addToCart);
router.get("/", authRequired, getCart);

export default router;
