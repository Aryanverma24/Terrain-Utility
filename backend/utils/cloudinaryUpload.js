import cloudinary from '../config/cloudinary.js';
const uploadToCloudinary = async (fileInput, folder = "uploads", publicId = null) => {
  try {
    if (!fileInput) {
      console.log("❌ No file input provided");
      return null;
    }

    const options = {
      folder,
      resource_type: "auto",
    };

    if (publicId) {
      options.public_id = publicId;
      options.overwrite = true;
    }

    let result;

    // ✅ CASE 1: BASE64 IMAGE (camera capture)
    if (typeof fileInput === "string" && fileInput.startsWith("data:")) {
      console.log("📸 Uploading BASE64 image");
      result = await cloudinary.uploader.upload(fileInput, options);
    }

    // ✅ CASE 2: FILE PATH (old multer flow)
    else {
      const fs = await import("fs");

      if (!fs.existsSync(fileInput)) {
        console.log("❌ File does NOT exist at path:", fileInput);
        return null;
      }

      console.log("📁 Uploading FILE PATH");
      result = await cloudinary.uploader.upload(fileInput, options);
    }

    if (!result?.secure_url) {
      console.log("⚠️ Upload succeeded but no secure_url");
      return null;
    }

    return result.secure_url;

  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error.message);
    return null;
  }
};
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log('Deleted old Cloudinary file:', publicId);
  } catch (err) {
    console.error('Failed to delete Cloudinary file:', err.message);
  }
};
export { deleteFromCloudinary, uploadToCloudinary };
