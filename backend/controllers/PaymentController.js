import Stripe from 'stripe';
import Transaction from '../modals/TransactionModal.js';
import Land from '../modals/LandModal.js';
import Payment from '../modals/PaymentModal.js';
import User from '../modals/UserModal.js';
import dotenv from 'dotenv';
dotenv.config();

const secretKey = process.env.STRIPE_SECRET_KEY;
const amount = Land.tokenConfig?.amount || Land.price;
if (!secretKey) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables');
  process.exit(1);
}

const stripe = new Stripe(secretKey);
export const createPaymentIntent = async (req, res) => {
  try {
    console.log("🔥 CREATE INTENT HIT");
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    const { landId } = req.body;
    const buyerId = req.user?._id;

    if (!landId) {
      return res.status(400).json({ msg: "landId missing" });
    }

    const land = await Land.findById(landId);

    if (!land) {
      return res.status(404).json({ msg: "Land not found" });
    }

    console.log("LAND FOUND:", land._id, land.transferStatus);

    const amount = land.tokenConfig?.amount || Math.round(land.price * 0.05);

    console.log("AMOUNT:", amount);

    const transaction = await Transaction.create({
      land: landId,
      buyer: buyerId,
      seller: land.owner,
      totalAmount: amount,
      status: "initiated",
    });

    console.log("TRANSACTION CREATED:", transaction._id);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "inr",
      metadata: {
        landId: landId.toString(),
        transactionId: transaction._id.toString(),
      },
    });

    console.log("STRIPE INTENT CREATED:", paymentIntent.id);

    const payment = await Payment.create({
      land: landId,
      buyer: buyerId,
      seller: land.owner,
      transaction: transaction._id,
      amount,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: "pending",
    });

    console.log("PAYMENT SAVED:", payment._id);

    return res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("🔥 CREATE INTENT ERROR:", err);
    return res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  }
};
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const payment = await Payment.findOne({ paymentIntentId });

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    const land = await Land.findById(payment.land);

    if (!land) {
      return res.status(404).json({ msg: "Land not found" });
    }

    const isFinalPayment = land.transferStatus === "appointment_booked";
    const isTokenPayment = land.transferStatus === "available";

    if (!isFinalPayment && !isTokenPayment) {
      return res.status(400).json({
        msg: "Payment not allowed in current state",
      });
    }

    const amount = isFinalPayment
      ? land.price
      : land.tokenConfig?.amount || Math.round(land.price * 0.05);

    // =========================
    // ✅ MARK PAYMENT SUCCESS
    // =========================
    payment.status = "succeeded";
    await payment.save();

    // =========================
    // 🧾 UPDATE TRANSACTION
    // =========================
    const transaction = await Transaction.findById(payment.transaction);

    transaction.status = "completed";
    transaction.completedAt = new Date();
    await transaction.save();

    const buyerUser = await User.findById(payment.buyer);

    // =========================
    // 💳 TOKEN PAYMENT FLOW
    // =========================
    if (isTokenPayment) {
  land.paymentStatus = "partial";
  land.transferStatus = "token_paid";

  // CRITICAL
  land.tokenBuyer = payment.buyer;

  // optional but good
  land.currentTransaction = payment.transaction;

  await land.save();

    

      return res.json({
        msg: "Token payment successful 🎉",
        nextStep: "book_appointment",
      });
    }

    // =========================
    // 🏡 FINAL PAYMENT FLOW
    // =========================
    if (isFinalPayment) {
      land.paymentStatus = "completed";
      land.owner = payment.buyer;
      land.ownerName = buyerUser?.username || "New Owner";

      land.isLocked = false;
      land.currentTransaction = null;
      land.transferStatus = "transferred";

      land.lastTransferDate = new Date();
      land.ownershipCount += 1;

      await land.save();

      return res.json({
        msg: "Final payment successful & land transferred 🎉",
        transactionId: transaction._id,
        nextStep: "completed",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const cancelPayment = async (req, res) => {
  try {
    const { landId } = req.body;

    const land = await Land.findById(landId);

    if (!land) {
      return res.status(404).json({ msg: "Land not found" });
    }

    land.isLocked = false;
    land.paymentStatus = "not_started";
    land.currentTransaction = null;

    await land.save();

    res.json({ msg: "Payment cancelled, land unlocked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      buyer: req.user._id,
    })
      .populate('land')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
