import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
{
    // Linked Asset
    land:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Land",
        required:true
    },

    // Buyer
    buyer:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    // Seller (missing in current schema)
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    // Linked transaction case (missing in current schema)
    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Transaction",
        required:true
    },

    // Amount paid in this payment event
    amount:{
        type:Number,
        required:true
    },

    currency:{
        type:String,
        default:"INR"
    },

    // Stripe
    paymentIntentId:{
        type:String,
        required:true
    },

    clientSecret:{
        type:String,
        default:null
    },

    paymentMethod:{
        type:String,
        enum:["cash","card","upi"],
        default:"card",
        required:true
    },

    // Payment lifecycle
    status:{
        type:String,
        enum:[
            "created",
            "pending",
            "requires_action",
            "succeeded",
            "failed",
            "cancelled",
            "refunded"
        ],
        default:"created"
    },

    // IMPORTANT: default changed from full -> token
    type:{
        type:String,
        enum:[
            "token",
            "remaining",
            "full"
        ],
        default:"token"
    },

    // For token workflow
    isEscrowHeld:{
        type:Boolean,
        default:false
    },

    releasedAt:{
        type:Date,
        default:null
    },

    // Failure handling
    failureReason:{
        type:String,
        default:null
    },

    // Refund tracking
    refundId:{
        type:String,
        default:null
    },

    refundedAmount:{
        type:Number,
        default:0
    },

    refundedAt:{
        type:Date,
        default:null
    },

    // Flexible metadata
    metadata:{
        type:Object,
        default:{}
    }

},
{
timestamps:true
}
);


// Helpful indexes
paymentSchema.index({ buyer:1 });
paymentSchema.index({ seller:1 });
paymentSchema.index({ transaction:1 });
paymentSchema.index({ paymentIntentId:1 });
paymentSchema.index({ status:1 });


export const Payment = mongoose.model("Payment",paymentSchema);

export default Payment;