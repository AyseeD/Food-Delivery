import express from "express";
import { getMenuByRestaurant, getItem } from "../controllers/menuController";

const router = express.Router();

router.get("/:restaurentId", getMenuByRestaurant);
router.get("item/:itemId", getItem);

export default router;