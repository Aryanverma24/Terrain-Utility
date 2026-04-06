    import mongoose from "mongoose";

    const transactionSchema = new mongoose.Schema({
        land: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Land",
        required: true,
        },

        buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        },
        seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        },

        totalAmount: Number,

        payments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
        },
        ],

        status: {
        type: String,
        enum: [
            "initiated",
            "partially_paid",
            "completed",
            "cancelled",
            "refunded",
        ],
        default: "initiated",
        },

        // Legal Flow
        lawyerApproved: {
        type: Boolean,
        default: false,
        },

        lawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        },

        agreementDoc: {
        type: String, // PDF URL
        },

        completedAt: {
        type: Date,
        },
    },
    { timestamps: true }
    );

export const Transaction = mongoose.model("Transaction", transactionSchema);            
export default Transaction;