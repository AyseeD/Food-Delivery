import express from "express";
import { getMenuByRestaurant, getItemById, createItem, getTags } from "../controllers/menuController.js";
import {authRequired, requireRole} from "../middleware/auth.js"

const router = express.Router();

router.get("/restaurant/:restaurantId", getMenuByRestaurant);
router.get("/item/:itemId", getItemById);
router.get("/tags", getTags);

//admin creates
router.post("/item", authRequired, requireRole("admin"), createItem);

export default router;