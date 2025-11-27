import express from "express";
import { register, login, userInfo } from "../controllers/authController";
import { authRequired } from "../middleware/auth";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/user", authRequired, userInfo);

export default router;