import express from "express";
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from "cookie-parser";
import multer from "multer";
//utilities 
import dbConnect from  './config/db.js'
import userRoutes from './routes/userRoutes.js'
import landRouter from './routes/landRoutes.js'
import Land from "./modals/LandModal.js";
import { createLand } from "./controllers/LandController.js";

const upload = multer({ dest: 'uploads/' })

const corsOption = {
  origin : "http://localhost:5173", 
  method : "POST,GET,DELETE,PUT,PATCH",
  Credentials : true
}
const app = express();
dotenv.config();
app.use(cors(corsOption));

const port = process.env.PORT;

dbConnect();

//express 

app.use(express.json()) 
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())

//routes 

app.use('/api/users', userRoutes),
app.use('/api/lands',landRouter),
app.post('/uploads', upload.single('image'), function (req, res, next) {
  const file = req.file;
  console.log(file);
  createLand(req.body,req,file);
  res.json({
    body:req.body,file:req.file
  })
})

app.listen(port,()=>{
  console.log(`server is running at ${port}`);
})