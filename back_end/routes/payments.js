import express from "express";
import { createPaymentRecord, confirmPayment } from "../controllers/paymentController.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authRequired, createPaymentRecord); 
router.post("/confirm", express.json(), confirmPayment);

export default router;
