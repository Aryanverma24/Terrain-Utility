import express from "express";
import {
  createPaymentIntent,
  confirmPayment,
  cancelPayment,
  getMyTransactions
} from "../controllers/PaymentController.js"
import { authenticate } from "../middlerwares/authMiddlewares.js";


const router = express.Router();

// =========================
// 💳 CREATE PAYMENT INTENT
// =========================
router.post("/create-intent", authenticate, createPaymentIntent);

// =========================
// ✅ CONFIRM PAYMENT
// =========================
router.post("/confirm", authenticate, confirmPayment);

// =========================
// ❌ CANCEL PAYMENT (Optional but useful)
// =========================
router.post("/cancel", authenticate, cancelPayment);


router.get("/my-transactions", authenticate, getMyTransactions);

export default router;