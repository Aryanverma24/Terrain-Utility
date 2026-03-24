// import cloudinary from "../config/cloudinary.js";
const BASE_URL = "http://localhost:5000";

 const getFileUrl = (fileObj) => {
     
  if (!fileObj) return "/placeholder.png";

  // OLD STRING
  if (typeof fileObj === "string") {
    return `${BASE_URL}/uploads/${fileObj}`;
  }

  // ✅ CLOUDINARY (PRIORITY)
  if (fileObj.cloudinary) return fileObj.cloudinary;

  // ✅ FIX FOR FULL PATH
  if (fileObj.local) {
    
    const filename = fileObj.local.split("\\").pop(); // 🔥 IMPORTANT
  
    return `${BASE_URL}/uploads/${filename}`;
  }

  return "/placeholder.png";
};
 const extractPublicId = (url) => {
  if (!url) return null;
  try {
    const afterUpload = url.split("/upload/")[1]; // everything after /upload/
    const withoutVersion = afterUpload.replace(/^v\d+\//, ""); // remove vXXXX/
    const fileNameWithExt = withoutVersion.split("/").pop();
    const fileName = fileNameWithExt.split(".")[0]; // remove extension
    return fileName; // only file name, folder is passed separately
  } catch (err) {
    console.error("extractPublicId failed:", err.message);
    return null;
  }
};


export{getFileUrl,extractPublicId };