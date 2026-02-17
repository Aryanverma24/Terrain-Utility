
import { Document } from "mongoose";

export const uploadDocuments = async (req, res) => {
  try {
    console.log("Files received:", req.files);
    console.log("Fields received:", req.body);

    const { landId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Loop over each file (upload.any gives array)
    req.files.forEach((file) => {
      console.log(`Saving ${file.fieldname}:`, file.filename);

      // Example: save to DB
      // await Document.create({
      //   land: landId,
      //   fileType: file.fieldname,
      //   filePath: file.filename,
      // });
    });

    res.status(200).json({ message: "Documents uploaded successfully!" });
  } catch (err) {
    console.error("Upload Documents Error:", err);
    res.status(500).json({ message: "Server error while uploading documents." });
  }
};
