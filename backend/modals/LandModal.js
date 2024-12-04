import mongoose from "mongoose";
import User from "./UserModal.js";

const ReviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: User,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5, // Assuming a 1-5 star rating system
        },
        review: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: false, // To prevent generating a separate ID for each review
    }
);

const LandSchema = new mongoose.Schema(
    {
        landtype: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        pincode: {
            type: Number,
            required: true,
        },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: User },
        ownerName: {
            type: String,
            required: true,
        },
        reviews: [ReviewSchema], // Array of review subdocuments
        averageRating: {
            type: Number,
            default: 0, // Will be calculated based on reviews
        },
    },
    {
        timestamps: true,
    }
);

export const Land = mongoose.model("Land", LandSchema);
export default Land;
