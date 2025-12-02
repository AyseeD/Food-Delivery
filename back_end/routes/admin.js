import express from "express";
import { adminLogin } from "../controllers/authController.js";
import { getUsersAmount, createUser, getRestaurantAmount, getOrderAmount, getAllUsers, deleteUser} from "../controllers/adminController.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/userAmount", getUsersAmount);
router.get("/restaurantAmount", getRestaurantAmount);
router.get("/orderAmount", getOrderAmount);
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.delete("/users/:id", deleteUser);

export default router;
