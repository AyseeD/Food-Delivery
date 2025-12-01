import express from "express";
import { adminLogin } from "../controllers/authController.js";
import { getUsersAmount, getRestaurantAmount, getOrderAmount, getAllUsers} from "../controllers/adminController.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/userAmount", getUsersAmount);
router.get("/restaurantAmount", getRestaurantAmount);
router.get("/orderAmount", getOrderAmount);
router.get("/users", getAllUsers);

export default router;
