import cloudinary from '../config/cloudinary.js';
const uploadToCloudinary = async (filePath, folder, publicId = null) => {
  try {
    // Safety check
    if (!filePath) {
      console.log('❌ No file path provided');
      return null;
    }

    //  Check file exists
    const fs = await import('fs');
    if (!fs.existsSync(filePath)) {
      console.log('❌ File does NOT exist at path:', filePath);
      return null;
    }

    // Options
    const options = {
      folder: folder,
      resource_type: 'auto', // important for pdf/images/videos
    };

    // Overwrite logic
    if (publicId) {
      options.public_id = publicId;
      options.overwrite = true;
    }

    const result = await cloudinary.uploader.upload(filePath, options);

    if (!result || !result.secure_url) {
      console.log('⚠️ Upload succeeded but no secure_url returned');
      return null;
    }

    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload failed:');
    console.error('Message:', error.message);
    console.error('Full error:', error);
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
