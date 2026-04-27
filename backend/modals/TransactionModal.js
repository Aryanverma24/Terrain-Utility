import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    land: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Land',
      required: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    totalAmount: Number,

    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
      },
    ],

   status:{
 type:String,
 enum:[
   "initiated",
   "token_paid",
   "agreement_pending",
   "appointment_booked",
   "deed_executed",
   "mutation_pending",
   "completed",
   "cancelled"
 ],
 default:"initiated"
},
    //registrar flow
registrar: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Registrar",
  default: null
},

appointmentId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Appointment",
  default: null
},

agreedPrice:{
 type:Number,
 default:null
},

tokenAmount: {
  type: Number,
  default: 0
},

tokenPaidAt: {
  type: Date,
  default: null
},
    // Legal Flow
    lawyerApproved: {
      type: Boolean,
      default: false,
    },

    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    agreementDoc: {
      type: String, // PDF URL
    },

    completedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
