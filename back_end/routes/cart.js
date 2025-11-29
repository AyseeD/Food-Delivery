import express from "express";
import { authRequired } from "../middleware/auth.js";
import { addToCart, getCart, deleteCartItem } from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", authRequired, addToCart);
router.get("/", authRequired, getCart);
router.delete("/:cart_item_id", authRequired, deleteCartItem);

export default router;
