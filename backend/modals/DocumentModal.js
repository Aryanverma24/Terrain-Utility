import mongoose from 'mongoose'

const DocumentSchema = new mongoose.Schema(
    {
        landImage : {
            type : String,
            required : true
        },
        
    },
    {
        timestamps : true
    })