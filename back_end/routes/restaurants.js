import express from "express";
import { getAll, getById, create, update, remove, getHours } from "../controllers/restaurantController";
import { authRequired, requireRole } from "../middleware/auth";

const router = express.Router();

router.get("/", getAll);
router.get("/:id", getById);
router.get("/:id/hours", getHours);

//admin controls so role must be admin
router.post("/", authRequired, requireRole("admin"), create);
router.put("/:id", authRequired, requireRole("admin"), update);
router.delete("/:id", authRequired, requireRole("admin"), remove);

export default router;