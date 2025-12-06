import express from "express";
import { getAll, getById, create, update, remove, search } from "../controllers/restaurantController.js";
import { authRequired } from "../middleware/auth.js";
import { adminRequired } from "../middleware/adminAuth.js";

const router = express.Router();

//public restaurant routes
router.get("/", getAll);
router.get("/search", search);
router.get("/:id", getById);

//admin restaurant routes
router.post("/", authRequired, adminRequired, create);
router.put("/:id", authRequired, adminRequired, update);
router.delete("/:id", authRequired, adminRequired, remove);

export default router;