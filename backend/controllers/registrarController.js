import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Registrar from "../modals/registrarModal.js";

//registrar activation and login
// First Time Activation
export const activateRegistrar = async (req,res)=>{
try{

const {
uniqueId,
officialEmail,
password,
confirmPassword
}=req.body;


// validations
if(
!uniqueId ||
!officialEmail ||
!password ||
!confirmPassword
){
return res.status(400).json({
message:"All fields required"
});
}

if(password!==confirmPassword){
return res.status(400).json({
message:"Passwords do not match"
});
}


// find preloaded registrar
const registrar = await Registrar.findOne({
registrarUniqueId: uniqueId,
officialEmail: officialEmail.toLowerCase()
});

if(!registrar){
return res.status(404).json({
message:"Registrar record not found"
});
}


// already activated
if(registrar.isActivated){
return res.status(400).json({
message:"Account already activated. Please login."
});
}


// hash password
const salt=await bcrypt.genSalt(10);
const hashedPassword=await bcrypt.hash(password,salt);


// activate account
registrar.password=hashedPassword;
registrar.isActivated=true;
registrar.activatedAt=new Date();

await registrar.save();

res.status(200).json({
success:true,
message:"Registrar account activated successfully"
});

}
catch(error){
console.log(error);

res.status(500).json({
message:"Server error"
});
}
};


//login registrar 
export const loginRegistrar = async (req,res)=>{
try{

const {
uniqueId,
password
}=req.body;


// validations
if(!uniqueId || !password){
return res.status(400).json({
message:"Please provide credentials"
});
}


// find registrar
const registrar = await Registrar.findOne({
registrarUniqueId: uniqueId
});

if(!registrar){
return res.status(404).json({
message:"Registrar not found"
});
}


// activated?
if(!registrar.isActivated){
return res.status(403).json({
message:"Activate account first"
});
}


// compare password
const isMatch = await bcrypt.compare(
password,
registrar.password
);

if(!isMatch){
return res.status(401).json({
message:"Invalid credentials"
});
}


// update login time
registrar.lastLogin = new Date();

await registrar.save();


// token
const token = jwt.sign(
{
registrarId: registrar._id,
role:"registrar"
},
process.env.JWT_SECRET,
{
expiresIn:"7d"
}
);


res.status(200).json({
success:true,
message:"Login successful",
token,

registrar:{
id:registrar._id,
name:registrar.registrarName,
office:registrar.officeName,
role:"registrar"
}
});

}
catch(error){
console.log(error);

res.status(500).json({
message:"Server error"
});
}
};