import express from "express";
import { getAll, getById, create, update, remove, getHours } from "../controllers/restaurantController.js";
import { authRequired } from "../middleware/auth.js";
import { adminRequired } from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/", getAll);
router.get("/:id", getById);
router.get("/:id/hours", getHours);

//admin controls so role must be admin
router.post("/", authRequired, adminRequired , create);
router.put("/:id", authRequired, adminRequired, update);
router.delete("/:id", authRequired, adminRequired, remove);

export default router;