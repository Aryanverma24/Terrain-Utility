import User from "../modals/UserModal.js";
import asyncHandler from "../middlerwares/asyncHandler.js";
import bcrypt from 'bcryptjs'
import createToken from '../utils/createToken.js'
import jwt from 'jsonwebtoken' 
import Land from "../modals/LandModal.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import userDocumentModal from "../modals/userDocumentModal.js";
import NotificationModal from "../modals/NotificationModal.js";
import { extractPublicId } from "../utils/getFileUrl.js";
import { deleteFromCloudinary } from "../utils/cloudinaryUpload.js";
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


const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existUser = await User.findOne({ email });

  if (!existUser) {
    return res.status(400).json({ error: "User not found" });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, existUser.password);

  if (!isMatch) {
    return res.status(400).json({ error: "Invalid Credentials" });
  }

  // Generate JWT
  const token = createToken(res, existUser._id);

  return res.status(200).json({
    _id: existUser._id,
    username: existUser.username,
    email: existUser.email,
    isAdmin: existUser.isAdmin,
    contactNumber: existUser.contactNumber,
    token
  });
});

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

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ✅ PREVENT CRASH
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await User.findById(id).select("-password");

  if (user) {
    res.status(200).json(user); // ✅ fixed
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

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

 const getLawyers = async (req, res) => {
  try {
    const lawyers = await User.find({ role: "lawyer" }).select(
      "_id username email"
    );

    res.json(lawyers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching lawyers" });
  }
};
// user upload fucntion for documnrs 
const uploadUserDocuments = async (req, res) => {
  try {
    console.log("🚀 Upload request received");
    console.log("User:", req.user);

    // Auth check
    if (!req.user || !req.user.id) {
      console.log("❌ Unauthorized user");
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const userId = req.user.id;
    console.log("User ID:", userId);

    // File validation
    if (!req.files || req.files.length === 0) {
      console.log("❌ No files uploaded", req.files);
      return res.status(400).json({ message: "No files uploaded." });
    }
    console.log("Files uploaded:", req.files.map(f => f.fieldname));

    // Map uploaded files by fieldname
    const uploadedFiles = {};
    for (let file of req.files) {
      uploadedFiles[file.fieldname] = file;
    }

    // Mandatory fields check
    const mandatoryFields = ["Aadhaar", "PAN", "ProfilePhoto", "AddressProof"];
    for (let field of mandatoryFields) {
      if (!uploadedFiles[field]) {
        console.log(`❌ Missing mandatory file: ${field}`);
        return res.status(400).json({ message: `${field} is required.` });
      }
    }

    const documentsArray = [];

    // Process all files
    // Process all files except optionalDocFile
for (let file of req.files) {
  if (file.fieldname === "optionalDocFile") continue; 

  let cloudUrl = null;
  console.log("Processing file:", file.fieldname, file.path, file.size);

  try {
    if (file.size < 5 * 1024 * 1024) {
      const uploaded = await uploadToCloudinary(file.path, `users/${userId}/kyc`);
      console.log("Cloud upload result:", uploaded);
      if (uploaded) cloudUrl = uploaded.replace("/upload/", "/upload/f_auto,q_auto/");
    }
  } catch (err) {
    console.log("Cloud upload error:", err.message);
  }

  documentsArray.push({
    type: file.fieldname,
    file: {
      local: file.path,
      cloudinary: cloudUrl,
    },
  });
}

// Optional document check
if (uploadedFiles.optionalDocFile && req.body.optionalDocType) {
  const optionalFile = uploadedFiles.optionalDocFile;
  let cloudUrl = null;

  try {
    if (optionalFile.size < 5 * 1024 * 1024) {
      const uploaded = await uploadToCloudinary(optionalFile.path, `users/${userId}/kyc`);
      if (uploaded) cloudUrl = uploaded.replace("/upload/", "/upload/f_auto,q_auto/");
    }
  } catch (err) {
    console.log("Optional cloud upload error:", err.message);
  }

  documentsArray.push({
    type: req.body.optionalDocType, 
    file: {
      local: optionalFile.path,
      cloudinary: cloudUrl,
    },
  });
}

    console.log("Documents array prepared:", documentsArray);

    if (documentsArray.length === 0) {
      console.log("❌ No valid documents processed");
      return res.status(400).json({ message: "No valid documents processed" });
    }

    // Save document
    const newDoc = new userDocumentModal({
      user: userId,
      documents: documentsArray,
    });
    await newDoc.save();
    console.log("Document saved:", newDoc._id);

    // Link document to user
    await User.findByIdAndUpdate(userId, { documentId: newDoc._id });
    console.log("User updated with documentId");

    return res.status(200).json({
      message: "User documents uploaded successfully",
      documentId: newDoc._id,
    });

  } catch (error) {
    console.error("❌ Upload failed:", error);
    return res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
};
//to see user uploaded docs 
const getMyDocuments = async (req, res) => {
  try {
    const doc = await userDocumentModal.findOne({ user: req.user.id });

    if (!doc) {
      return res.status(404).json({ message: "No documents found" });
    }

    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ message: "Error fetching documents" });
  }
};

 const getPendingUserDocuments = async (req, res) => {
  try {
    // Only lawyers allowed

    if (!req.user || req.user.role !== "lawyer") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get all documents where at least one doc is pending
    const documents = await userDocumentModal
      .find({
        "documents.status": { $in: ["pending"] },
      })
      .populate("user", "name email");

    res.status(200).json(documents);
  } catch (error) {
    console.error("Fetch pending docs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
//to update status of each doc 
const updateUserDocumentStatus = async (req, res) => {
  try {
    // Read from params and body
    const { docId, status } = req.params;
    const { childId } = req.body;

    //  Role check
    if (!req.user || req.user.role !== "lawyer") {
      return res.status(403).json({ message: "Access denied" });
    }

    //  Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const parentDoc = await userDocumentModal.findById(docId);
    if (!parentDoc) {
      return res.status(404).json({ message: "Parent doc not found" });
    }

    const lawyerId = req.user.id;

    // ============================
    //  UPDATE CHILD DOCUMENT(S)
    // ============================
    if (childId) {
      // Single doc update
      const child = parentDoc.documents.id(childId);
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }

      child.status = status;

      //  NEW: Track reviewer
      child.reviewedBy = lawyerId;
      child.reviewedAt = new Date();

    } else {
      // Bulk update
      parentDoc.documents.forEach((d) => {
        d.status = status;

        //  NEW: Track reviewer
        d.reviewedBy = lawyerId;
        d.reviewedAt = new Date();
      });
    }

    // ============================
    // UPDATE PARENT STATUS
    // ============================
    if (parentDoc.documents.every((d) => d.status === "approved")) {
      parentDoc.status = "approved";

      //  NEW: FULL APPROVAL
      parentDoc.isFullyApproved = true;
      parentDoc.approvedBy = lawyerId;

    } else if (parentDoc.documents.some((d) => d.status === "rejected")) {
      parentDoc.status = "rejected";

      //  Reset full approval
      parentDoc.isFullyApproved = false;
      parentDoc.approvedBy = null;

    } else {
      parentDoc.status = "pending";

      //  Reset full approval
      parentDoc.isFullyApproved = false;
      parentDoc.approvedBy = null;
    }

    await parentDoc.save();

    res.status(200).json({
      message: "Updated successfully",
      parentDoc,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
//to repuload a document that is rejected
const reuploadUserDocumentHandler = asyncHandler(async (req, res) => {
  const { docId } = req.params;
  const userId = req.user._id;

  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const parentDoc = await userDocumentModal.findOne({ user: userId });
  if (!parentDoc) return res.status(404).json({ message: "User documents not found" });

  const subDoc = parentDoc.documents.id(docId);
  if (!subDoc) return res.status(404).json({ message: "Sub-document not found" });

  if (subDoc.status !== "rejected") 
    return res.status(400).json({ message: `Current status is '${subDoc.status}', not 'rejected'` });

  // Upload new file to Cloudinary
  const oldPublicId = subDoc.file?.cloudinary ? extractPublicId(subDoc.file.cloudinary) : null;
  const cloudUrl = await uploadToCloudinary(req.file.path, `users/${userId}/documents`);
  if (oldPublicId) await deleteFromCloudinary(oldPublicId);

  subDoc.file = { local: req.file.path, cloudinary: cloudUrl };
  subDoc.status = "pending";
  subDoc.uploadedAt = new Date();

  await parentDoc.save();

  // Notify all lawyers
  const io = req.app.get("io");
  const lawyers = await User.find({ role: "lawyer" });
  for (const lawyer of lawyers) {
    const notif = new NotificationModal({
      userId: lawyer._id,
      title: "User Document Reuploaded",
      message: `${req.user.username} reuploaded a document.`,
      targetRole: "lawyer",
    });
    await notif.save();
    io?.to(lawyer._id.toString()).emit("receive-notification", notif);
  }

  res.status(200).json({ message: "Reuploaded successfully", document: subDoc });
});
//function to show the lawyer users who he approved 
const getApprovedUsersByLawyer = async (req, res) => {
  try {
    const lawyerId = req.user.id;

    const approvedDocs = await userDocumentModal
      .find({ approvedBy: lawyerId, isFullyApproved: true })
      .populate("user", "username email");

    res.status(200).json(approvedDocs);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch approved users" });
  }
};
//function to make  lawyer the docuemtns visible taht he approved 
const getUserDocumentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    //  Only lawyer can access
    if (!req.user || req.user.role !== "lawyer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const userDocs = await userDocumentModal
      .findOne({ user: userId })
      .populate("user", "username email");

    if (!userDocs) {
      return res.status(404).json({ message: "No documents found" });
    }

    res.status(200).json(userDocs);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export {
    createUser,
    loginUser,
    logout,
    getAllUser,
    getCurrentUserProfile,
    updateCurrentUserProfile,
    deleteUser,
    getUserById,
    updateUserById,
    getLawyers,
    uploadUserDocuments,
    getMyDocuments,
    getPendingUserDocuments,
    updateUserDocumentStatus,
    reuploadUserDocumentHandler,
    getApprovedUsersByLawyer,
    getUserDocumentsByUserId
} 