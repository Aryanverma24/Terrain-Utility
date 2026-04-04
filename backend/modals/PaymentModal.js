import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    land :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Land",
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount :{
        type: Number,
        required: true
    },   

    currency: {
      type: String,
      default: "INR",
    },
      // Stripe Data
    paymentIntentId: {
      type: String,
      required: true,
    },

     clientSecret: {
      type: String,
    },

    paymentMethod :{
        type: String,
        enum: ["cash", "card", "upi"],
        default : "card",
        required: true
    },
     status: {
      type: String,
      enum: [
        "created",
        "pending",
        "requires_action",
        "succeeded",
        "failed",
        "cancelled",
        "refunded",
      ],
      default: "created",
    },

        // Payment Type
    type: {
      type: String,
      enum: ["full", "token", "remaining"],
      default: "full",
    },
      // Failure Handling
    failureReason: {
      type: String,
      default: null,
    },

      // Refund
    refundId: {
      type: String,
      default: null,
    },

    refundedAmount: {
      type: Number,
      default: 0,
    },

       // Metadata 
    metadata: {
      type: Object,
      default: {},
    },
},{
    timestamps: true,
})

export const Payment = mongoose.model("Payment", paymentSchema)
export default Payment