import jwt from "jsonwebtoken"
import User  from "../modals/UserModal.js"
import asyncHandler from "../middlerwares/asyncHandler.js"

const authenticate = asyncHandler(async(req,res,next)=>{
   
    //  const token = req.cookies.jwt;
    const userToken = req.headers.authorization;
    console.log(userToken);
    if(!userToken){
        res.status(401)
        throw new Error("Not Authorized. token failed")
    }
   const token = userToken?.split("Bearer ")[1]
     
    if(token){
        try {
            const decoded =  jwt.verify(token,process.env.JWT_SECRET)
            req.user = await User.findById(decoded.userId).select("-password");
            console.log(req.user)
            next();
        } catch (error) {
            res.status(401)
            throw new Error("Not Authorized. token failed")
        }
    }
    else{
        res.status(401)
        throw new Error("Not Authorized. no token")
    }
}
)

const authorizeAdmin = asyncHandler ( async (req,res,next)=>{
    
    const users = req.cookies.jwt;
    const decoded =  jwt.verify(users,process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password");
    if(user.isAdmin){
        next();
    }else{
        res.status(401).send("Unauthorized Admin")
    }
    
})


export {
    authenticate,
    authorizeAdmin
}