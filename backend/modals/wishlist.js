import mongoose from "mongoose";
import User from "./UserModal.js";
import Land from "./LandModal.js";

const wishlistSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.ObjectId,
        ref : User,
        required : true
    },
    lands :[ {
        type : mongoose.Schema.ObjectId,
        ref : Land,
        required : true
    }
    ]
},{timestamps : true})

export const Wishlist = mongoose.model("Wishlist",wishlistSchema)
export default Wishlist;