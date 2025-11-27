import express from "express";
import { createPaymentRecord, confirmPayment } from "../controllers/paymentController.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authRequired, createPaymentRecord);   // create local payment record and return data for frontend to process
router.post("/confirm", express.json(), confirmPayment); // webhook or frontend confirm -> update DB

export default router;
