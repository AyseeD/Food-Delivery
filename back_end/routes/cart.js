import express from "express";
import { authRequired } from "../middleware/auth.js";
import { addToCart, getCart, deleteCartItem, updateCartItemQuantity } from "../controllers/cartController.js";

const router = express.Router();

//cart routes
router.post("/add", authRequired, addToCart);
router.get("/", authRequired, getCart);
router.delete("/:cart_item_id", authRequired, deleteCartItem);
router.patch("/:cartItemId/quantity", authRequired, updateCartItemQuantity);

export default router;
