import User from "../modals/UserModal.js";
import asyncHandler from "../middlerwares/asyncHandler.js";
import bcrypt from 'bcryptjs'
import createToken from '../utils/createToken.js'
import jwt from 'jsonwebtoken' 

const createUser = asyncHandler(async(req,res) => {
    const {username , email , password , contactNumber , isAdmin } = req.body

    // console.log(username)

    if(!username || !email || !password || !contactNumber || !isAdmin){
        res.status(400).json({"message" : "all feilds are required"})
    }
    const existingUser = await User.findOne({email});
    if(existingUser) res.status(400).json("user already exist!");

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password,salt)

    const newUser = new User({username,email,password :  hashedPassword ,contactNumber,isAdmin})

     try {
        await newUser.save()
        createToken(res,newUser._id);
        res.status(200).send(newUser)
     } catch (error) {
        res.status(500)
        throw new error("invalid user")
     }
})


const loginUser = asyncHandler(async(req,res) =>{

    const {email , password } = req.body;

    const existUser = await User.findOne({email})

    if(existUser){
        const checkPassword = await bcrypt.compare(password,existUser.password)

        if(checkPassword){
            createToken(res,existUser._id)

            res.status(200).json({
                _id : existUser._id,
                username : existUser.username,
                email : existUser.email,
                isAdmin : existUser.isAdmin,
                contactNumber : existUser.contactNumber
            })
        }
        return 
    }

})

const logout = asyncHandler(async(req,res)=>{
    res.cookie("jwt","",{
        httpOnly : true,
        expires : new Date(0)
    });
    res.status(200).json({
        message : "user logout successfully"
    })
})

const getAllUser = asyncHandler(async (req,res)=>{
    //get all users
    const users = await User.find({}).select("-password")
    res.json(users);
})

const getCurrentUserProfile = asyncHandler( async (req,res) => {

    const userToken = req.cookies.jwt;
    const decoded = jwt.verify(userToken,process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password")
    
    if(user){
        res.status(201)
        .json({
            _id : user._id,
            username : user.username,
            email : user.email,
            isAdmin : user.isAdmin,
            contactNumber : user.contactNumber
        })
    }
    else{
        res.status(404)
        throw new Error("User not found")
    }
})

const updateCurrentUserProfile = asyncHandler(async(req,res)=>{

    const {username , email, password, contactNumber} = req.body
    const userToken = req.cookies.jwt;
    const decoded = jwt.verify(userToken,process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password")

    if(user){
        user.username = username  || user.username
        user.email = email || user.email
        user.contactNumber = contactNumber || user.contactNumber

        if(password){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password,salt);
            user.password = hashedPassword
        }
        const updatedUser = await user.save();

        res.status(200)
        .json(
            {
                _id : updatedUser._id,
                username : updatedUser.username,
                email : updatedUser.email,
                isAdmin : updatedUser.isAdmin,
                contactNumber : updatedUser.contactNumber
            }
        )
    }else{
        res.status(404)
        throw new Error("user nor found")
    }
})

const deleteUser = asyncHandler ( async (req,res)=>{
    const user = await User.findById(req.params.id)
    if(user){
        if(user.isAdmin){
            res.status(404)
            throw new Error("cannot delete admin user")
        }
        await User.deleteOne({_id : user._id})
        res.status(201).json({message : "User Removed successfully"})
    }
    else{
        res.status(401)
        throw new Error("Can't deleted user because of admin rights")
    }
})

const getUserById = asyncHandler (async (req,res)=>{
    const user = await User.findById(req.params.id).select("-password");

    if(user){
        res.status(201)
        .json(user)
    }
    else{
        res.status(404)
        throw new Error("User not find")
    }
})

const updateUserById = asyncHandler (async(req,res)=>{

    const user = await User.findById(req.params.id);
    const {username,email,isAdmin,contactNumber,password} = req.body

    if(user){

        user.username = username || user.username
        user.email = email || user.email
        user.isAdmin = Boolean(isAdmin) || user.isAdmin
        user.contactNumber = contactNumber || user.contactNumber

        if(password){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password,salt);
            user.password = hashedPassword
        }
        const updatedUser = await user.save();

        res.status(200)
        .json(
            {
                _id : updatedUser._id,
                username : updatedUser.username,
                email : updatedUser.email,
                isAdmin : updatedUser.isAdmin,
                contactNumber: updatedUser.contactNumber
            }
        )
    }
    else{
        res.status(404)
        throw new Error("User not found")
    }
})


export {
    createUser,
    loginUser,
    logout,
    getAllUser,
    getCurrentUserProfile,
    updateCurrentUserProfile,
    deleteUser,
    getUserById,
    updateUserById
} 