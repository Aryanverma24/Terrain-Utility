import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username : {
            type : String,
            required :true,
            unique : true
        },
        email : {
            type : String,
            required :true,
            unique : true,
        },
        contactNumber : {
            type : Number,
            required : true,
            unique : true,
        },
        password : {
            type : String,
            required : true,
            minLength : [8,"Password must have 8 Characters"]
        },
        isAdmin : {
            type : Boolean,
            required :true,
            default : false
        },

        City : {
            type : String,
            default : "unknown", 
          
        },
        state : {
            type :String,
            default : "unknown",
            
        },
        gender : {
            type : String ,
            default : "unknown",
          
        },
        age : {
            type : Number,
            default : 20,
           
        },
        faceDescriptor: { 
            type: [Number], 
            default: [] 
        },
        bio : {
            type :  String,
            default : ""
        }
    },
    {
        timestamps : true
    })

    export const User = mongoose.model("User",userSchema);
    export default User ;