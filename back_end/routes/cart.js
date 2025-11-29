import express from "express";
import { authRequired } from "../middleware/auth.js";
import { addToCart } from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", authRequired, addToCart);

export default router;
