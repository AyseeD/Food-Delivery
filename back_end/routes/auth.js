import express from "express";
import { register, login, userInfo, updateUser, updatePassword } from "../controllers/authController.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/user", authRequired, userInfo);
router.put("/update", authRequired, updateUser);
router.put("/update-password", authRequired, updatePassword);

export default router;