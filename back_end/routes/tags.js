import express from "express";
import { getAll, getRestaurantTags } from "../controllers/tagController.js";

const router = express.Router();

//tag routes
router.get("/", getAll);
router.get("/restaurant-tags", getRestaurantTags);

export default router;
