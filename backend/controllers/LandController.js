import Land from '../modals/LandModal.js'
import asyncHandler from '../middlerwares/asyncHandler.js'
import jwt from 'jsonwebtoken' 
import User from '../modals/UserModal.js'

const createLand = asyncHandler(async(req,res)=>{
   
    const {landtype,city , state , pincode} = req.body

    const userToken = req.cookies.jwt
    const decoded = jwt.verify(userToken,process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password")

    if(!landtype || !city || !state || !pincode){
        res.status(404).send("all fields are required!")
    }
    const userName = user.username

    const land = new Land({landtype , city , state, pincode,owner : user,ownerName : userName}) 

    try {
        await land.save()
        res.status(200).send(land)
    } catch (error) {
        res.status(500).send("unable to save in database")
    }
})

const getAllLands = asyncHandler(async (req,res)=>{
    const lands = await Land.find({})
    res.status(200).send(lands)
})

const getLandById = asyncHandler(async(req,res)=>{

    const land = await Land.findById(req.params.id)
    if(land){
        res.status(200).send(land)
    }
    else{
        res.status(400).send("land not found!")
    }
})

const getLandByUserId = asyncHandler(async(req,res)=>{
    
   try {
     const userToken = req.cookies.jwt
     const decoded = jwt.verify(userToken,process.env.JWT_SECRET)
     const user = await User.findById(decoded.userId).select("-password")
     const userId = user._id
     // res.send(user)
     const owner = await Land.find({owner : userId})
     res.send(owner)
   } catch (error) {
        res.status(400).send("user not found!")
   }
})

const updateLandById = asyncHandler(async(req,res)=>{

    const land = await Land.findById(req.params.id)

    const {landtype,city,pincode,state,owner} = req.body

    if(land){
        land.landtype = landtype || land.landtype
        land.city = city || land.city
        land.state = state || land.state
        land.pincode = pincode || land.pincode
        
        if(owner){
            const checkOwner = await User.find({username : owner})
            if(checkOwner){
                const ownerId = checkOwner[0]._id
                const ownerName = checkOwner[0].username
                land.owner = ownerId || land.owner
                land.ownerName = ownerName || land.ownerName
            }else{
                res.status(400).send("User not find")
            }
        }

        res.status(200).json({
            _id : land._id,
            landtype : land.landtype,
            city : land.city,
            pincode : land.pincode,
            state : land.state,
            owner : land.owner,
            ownerName : land.ownerName
        })
    }else{
        res.status(400).send("Land not find!")
    }

})

const deleteLandById = asyncHandler(async(req,res)=>{

    const landId = req.params

    if(landId){
      await Land.findByIdAndDelete(landId.id);
      res.status(200).send("land successfully removed!")
    }else{
        res.status(400).send("land not found")
    }
})

const getLandbyUser = asyncHandler(async(req,res)=>{
    try {
        const username = req.params.username;
       
        const user = await User.find({username : username});
        const userId = user[0]._id
        const owner = await Land.find({owner : userId})
        res.send(owner)
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching lands" });
      }
})

//land type

const getLandByType = asyncHandler(async(req,res)=>{
    try {
        const landtype = req.params.landType
        res.send(landtype)
        const lands = await Land.find({landtype : landtype})
        res.send(lands)
    } catch (error) {
        res.status(200).send("error")
    }
})

export {
    createLand,
    getAllLands,
    getLandById,
    getLandByUserId,
    updateLandById,
    deleteLandById,
    getLandbyUser,
    getLandByType
}