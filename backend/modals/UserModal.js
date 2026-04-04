import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
   username: { type: String, required: true, unique: true },
   email: { type: String, required: true, unique: true },
   contactNumber: { type: Number, required: true, unique: true },
   password: { type: String, required: true, minLength: 8 },
   isAdmin: { type: Boolean, default: false },
   role: { type: String, enum: ["buyerSeller", "lawyer", "admin"], default: "buyerSeller" },  
   City: { type: String, default: "unknown" },
   state: { type: String, default: "unknown" },
   gender: { type: String, default: "unknown" },
   age: { type: Number, default: 20 },
   faceDescriptor: { type: [Number], default: [] },
   documentId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "UserDocuments",
},
consultationLands: [
  {
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  },
],
isVerifiedBuyer: {
  type: Boolean,
  default: false,
},
   bio: { type: String, default: "" }
});


    export const User = mongoose.model("User",userSchema);
    export default User ;