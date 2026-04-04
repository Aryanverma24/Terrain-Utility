import Stripe from "stripe";
import Transaction from "../modals/TransactionModal.js";
import Land from '../modals/LandModal.js'
import Payment from "../modals/PaymentModal.js";
import User from "../modals/UserModal.js";


const secretKey = process.env.STRIPE_SECRET_KEY

if (!secretKey) {
  console.error("STRIPE_SECRET_KEY is not set in environment variables");
  process.exit(1);
}

const stripe = new Stripe(secretKey)
export const createPaymentIntent = async (req, res) => {
  try {
    const { landId } = req.body;
    const buyerId = req.user._id;

    const land = await Land.findById(landId);

    if (!land) {
      return res.status(404).json({ msg: "Land not found" });
    }

    if (land.isLocked) {
      return res.status(400).json({ msg: "Land is already in transaction" });
    }

    // 🔒 Lock land
    land.isLocked = true;
    land.paymentStatus = "pending";
    await land.save();

    // 🧾 Create transaction
    const transaction = await Transaction.create({
      land: landId,
      buyer: buyerId,
      seller: land.owner,
      totalAmount: land.price,
      status: "initiated",
    });

    // 💳 Stripe Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: land.price * 100,
      currency: "inr",
      metadata: {
        landId: landId.toString(),
        transactionId: transaction._id.toString(),
      },
    });

    // 💾 Save payment
    const payment = await Payment.create({
      land: landId,
      buyer: buyerId,
      seller: land.owner,
      transaction: transaction._id,
      amount: land.price,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: "pending",
    });

    // 🔗 link transaction to land
    land.currentTransaction = transaction._id;
    await land.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const payment = await Payment.findOne({ paymentIntentId });

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    // ✅ Update payment
    payment.status = "succeeded";
    await payment.save();

    // 🧾 Transaction update
    const transaction = await Transaction.findById(payment.transaction);

    transaction.status = "completed";
    transaction.completedAt = new Date();
    await transaction.save();

    // 🏡 Update land
    const land = await Land.findById(payment.land);

    land.paymentStatus = "completed";
    land.owner = payment.buyer;

    // 🔥 fetch real user name
    const buyerUser = await User.findById(payment.buyer);
    land.ownerName = buyerUser?.username || "New Owner";

    land.isLocked = false;
    land.currentTransaction = null;

    land.lastTransferDate = new Date();
    land.ownershipCount += 1;

    await land.save();

    res.json({ 
    msg: "Payment successful & land transferred 🎉",
    transactionId: transaction._id
  });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cancelPayment = async (req, res) => {
  const { landId } = req.body;

  const land = await Land.findById(landId);

  land.isLocked = false;
  land.paymentStatus = "not_started";
  land.currentTransaction = null;

  await land.save();

  res.json({ msg: "Payment cancelled, land unlocked" });
};

export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      buyer: req.user._id,
    })
      .populate("land")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};