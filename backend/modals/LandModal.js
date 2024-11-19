import mongoose from "mongoose";
import User from "./UserModal.js";

const LandSchema = new mongoose.Schema(
    {
        landtype : {
            type : String,
            required : true,
        },
        image : {
            type : String ,
            reuired : true
        },
        city : {
            type : String,
            required : true,
        },
        state : {
            type : String,
            required : true,
        },
        pincode : {
            type : Number ,
            required : true,
        },
        owner : {
            type : mongoose.Schema.Types.ObjectId,
            ref : User
        },
        ownerName : {
            type : String,
            required : true
        }
    },
    {
        timestamps : true
    }
)

export const Land = mongoose.model("Land",LandSchema);
export default Land;