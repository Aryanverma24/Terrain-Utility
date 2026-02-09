import User from "../modals/UserModal.js";
import asyncHandler from "../middlerwares/asyncHandler.js";
import bcrypt from 'bcryptjs'
import createToken from '../utils/createToken.js'
import jwt from 'jsonwebtoken' 
import Land from "../modals/LandModal.js";

const createUser = asyncHandler(async (req, res) => {
    const { username, email, password, contactNumber, isAdmin, role } = req.body;


    if (!username || !email || !password || !contactNumber|| !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
    username,
    email,
    password: hashedPassword,
    contactNumber,
    isAdmin,
    role,  // ⭐ Add this
});

    try {
        await newUser.save();
        const token = createToken(res, newUser);

        return res.status(201).send({ user: newUser, token });
    } catch (error) {
        res.status(500);
        throw new Error("Invalid user creation");
    }
});



const loginUser = asyncHandler(async(req,res, skipPasswordCheck = false) =>{

    const {email , password } = req.body;

    const existUser = await User.findOne({email})

    // if(!existUser){
    //     const checkPassword = await bcrypt.compare(password,existUser.password)

    //     if(checkPassword){
    //         const token = createToken(res,existUser._id)

    //         return res.status(200).json({
    //             _id : existUser._id,
    //             username : existUser.username,
    //             email : existUser.email,
    //             isAdmin : existUser.isAdmin,
    //             contactNumber : existUser.contactNumber,
    //             token
    //         })
    //     }
    //     return  res.status(400).json({
    //         error:"Invalid Credentials"
    //     })
    // }
    // return  res.status(400).json({
    //     error:"Invalid Credentials"
    // })

    
    if (!existUser) {
        return res.status(400).json({ error: "User not found" });
    }

    //  Agar face auth se login ho raha hai to password check skip kare
    if (!skipPasswordCheck) {
        const checkPassword = await bcrypt.compare(password, existUser.password);
        if (!checkPassword) {
            return res.status(400).json({ error: "Invalid Credentials" });
        }
    }

    const token = createToken(res, existUser);

return res.status(200).json({
    _id: existUser._id,
    username: existUser.username,
    email: existUser.email,
    role: existUser.role,   // ⭐ Send role
    isAdmin: existUser.isAdmin,
    contactNumber: existUser.contactNumber,
    token
});


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
    const user = req.user;
    if(user){
        res.status(201)
        .json({data:user, message:"User Data Fetched"})
    }
    else{
        res.status(404)
        throw new Error("User not found")
    }
})

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    const { username, email, password, contactNumber, city, state, totalLands, age, gender, bio } = req.body;

    const userToken = req.headers.authorization && req.headers.authorization.startsWith('Bearer')
        ? req.headers.authorization.split(' ')[1]
        : null;

    if (!userToken) {
        res.status(401);
        throw new Error("Not authorized, token missing");
    }

    try {
        const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // Update user fields
        user.username = username || user.username;
        user.email = email || user.email;
        user.contactNumber = contactNumber || user.contactNumber;
        user.City = city || user.City;
        user.state = state || user.state;
        user.totalLands = totalLands || user.totalLands;
        user.gender = gender || user.gender;
        user.age = age || user.age;
        user.bio = bio || user.bio;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        // Save updated user
        const updatedUser = await user.save();

        // ✅ Now update Land model using user._id
        await Land.updateMany(
            { owner: user._id },
            { $set: { ownerName: updatedUser.username } }
        );

        // ✅ Update reviews[].username where user id matches
        await Land.updateMany(
            { "reviews.user": user._id },
            {
                $set: { "reviews.$[elem].username": updatedUser.username }
            },
            {
                arrayFilters: [{ "elem.user": user._id }]
            }
        );

        res.status(200).json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            contactNumber: updatedUser.contactNumber,
            gender: updatedUser.gender,
            City: updatedUser.City,
            state: updatedUser.state,
            age: updatedUser.age,
            bio: updatedUser.bio
        });
    } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error("Not authorized, token failed");
    }
});



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