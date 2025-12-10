import express from "express";
import { getAll, getRestaurantTags, createTag, updateTag, deleteTag } from "../controllers/tagController.js";

const router = express.Router();

//tag routes
router.get("/", getAll);
router.get("/restaurant-tags", getRestaurantTags);
router.post("/new-tags", createTag);
router.put("/:id", updateTag);
router.delete("/:id", deleteTag);

export default router;
