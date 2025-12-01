import express from "express";
import { register, login, userInfo, adminLogin } from "../controllers/authController.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/user", authRequired, userInfo);

export default router;