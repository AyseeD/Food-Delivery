import express from "express";
import { 
  getMenuByRestaurant, 
  getItemById, 
  createItem,
  getTags,
  getCategoriesByRestaurant,
  updateItem,
  deleteItem,
  updateItemAvailability,
  createCategory,
  updateCategory,
  deleteCategory
} from "../controllers/menuController.js";
import { authRequired } from "../middleware/auth.js";
import { adminRequired } from "../middleware/adminAuth.js";

const router = express.Router();

// Public routes
router.get("/restaurant/:restaurantId", getMenuByRestaurant);
router.get("/item/:itemId", getItemById);
router.get("/tags", getTags);
router.get("/categories/:restaurantId", getCategoriesByRestaurant);

// Admin routes
router.post("/item", authRequired, adminRequired, createItem);
router.put("/item/:itemId", authRequired, adminRequired, updateItem);
router.delete("/item/:itemId", authRequired, adminRequired, deleteItem);
router.patch("/item/:itemId", authRequired, adminRequired, updateItemAvailability);
router.post("/categories", authRequired, adminRequired, createCategory);
router.put("/categories/:categoryId", authRequired, adminRequired, updateCategory);
router.delete("/categories/:categoryId", authRequired, adminRequired, deleteCategory);

export default router;