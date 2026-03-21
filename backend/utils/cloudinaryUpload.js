import cloudinary from "../config/cloudinary.js";
 const uploadToCloudinary = async (filePath, folder, publicId = null) => {
  try {
    // ✅ Define options object
    const options = {
      folder: folder, // the folder path in Cloudinary
    };

    // 🔥 If publicId is provided (re-upload), overwrite the same file
    if (publicId) {
      options.public_id = publicId;
      options.overwrite = true;
    }

   
    const result = await cloudinary.uploader.upload(filePath, options);

    

    return result.secure_url;

  } catch (error) {
    console.error("Cloudinary overwrite failed:", error.message);
    return null;
  }
};
 const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log("Deleted old Cloudinary file:", publicId);
  } catch (err) {
    console.error("Failed to delete Cloudinary file:", err.message);
  }
};
export{deleteFromCloudinary,uploadToCloudinary};