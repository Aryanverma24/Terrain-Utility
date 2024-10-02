import express from "express";
import dotenv from 'dotenv'
import path from 'path'
import cors from 'cors'
import cookieParser from "cookie-parser";

//utilities 
import dbConnect from  './config/db.js'
import userRoutes from './routes/userRoutes.js'
import landRouter from './routes/landRoutes.js'


const app = express();
dotenv.config();
app.use(cors());

const port = process.env.PORT;

dbConnect();
//express 

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())


//routes 

app.use('/api/users', userRoutes);
app.use('/api/lands',landRouter)

app.listen(port,()=>{
  console.log(`server is running at ${port}`);
})