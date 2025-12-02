import express from "express";
import { getAll, getRestaurantTags } from "../controllers/tagController.js";

const router = express.Router();

router.get("/", getAll);
router.get("/restaurant-tags", getRestaurantTags);

export default router;
