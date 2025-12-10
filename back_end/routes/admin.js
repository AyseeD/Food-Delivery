import express from "express";
import { adminLogin } from "../controllers/authController.js";
import { getUsersAmount, getAllMenuByRestaurant, createUser, getRestaurantAmount, getOrderAmount, getAllUsers, deleteUser,reactivateUser} from "../controllers/adminController.js";

const router = express.Router();

//admin routes
router.post("/login", adminLogin);
router.get("/userAmount", getUsersAmount);
router.get("/restaurantAmount", getRestaurantAmount);
router.get("/orderAmount", getOrderAmount);
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/reactivate", reactivateUser);
router.get("/restaurant/:restaurantId", getAllMenuByRestaurant);

export default router;