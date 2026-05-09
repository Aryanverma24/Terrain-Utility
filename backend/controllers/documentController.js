import asyncHandler from '../middlerwares/asyncHandler.js';
import Document from '../modals/DocumentModal.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { extractPublicId } from '../utils/getFileUrl.js';
import { deleteFromCloudinary } from '../utils/cloudinaryUpload.js';
import Land from '../modals/LandModal.js';
import User from '../modals/UserModal.js';
import cloudinary from '../config/cloudinary.js';
import Notification from '../modals/NotificationModal.js';
export const reuploadDocumentHandler = asyncHandler(async (req, res) => {
  const { docId } = req.params;

  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const parentDoc = await Document.findOne({ 'documents._id': docId });
  if (!parentDoc) return res.status(404).json({ message: 'Document not found' });

  const subDoc = parentDoc.documents.id(docId);
  if (!subDoc) return res.status(404).json({ message: 'Sub-document not found' });

 const land = await Land.findById(parentDoc.land);

// ALLOW REUPLOAD DURING:
// 1. rejected correction workflow
// 2. ownership refresh workflow

const canReupload =
  subDoc.status === 'rejected' ||
  land?.documentsRefreshRequired === true;

if (!canReupload) {
  return res.status(400).json({
    message: 'Document cannot be reuploaded right now',
  });
}


  console.log('Reupload - req.file.path:', req.file.path);

  let cloudUrl = null;
  let oldPublicId = null;

  try {
    const oldCloudUrl = subDoc.file?.cloudinary;
    console.log('Reupload - old Cloudinary URL:', oldCloudUrl);

    oldPublicId = extractPublicId(oldCloudUrl);
    console.log('Reupload - publicId to overwrite:', oldPublicId);

    const folder = `lands/${req.user.id}/${land._id}/documents`;
    console.log('Reupload - target folder:', folder);

    // ✅ Upload
    cloudUrl = await uploadToCloudinary(req.file.path, folder, oldPublicId);

    console.log('Reupload - new Cloudinary URL:', cloudUrl);

    // ✅ Delete old file safely
    if (oldPublicId) {
      await deleteFromCloudinary(oldPublicId);
    }
  } catch (err) {
    console.log('Cloudinary re-upload failed:', err.message);
  }

  subDoc.file = {
    local: req.file.path,
    cloudinary: cloudUrl,
  };

  subDoc.status = 'pending';

  await parentDoc.save();

  // ✅ Notifications FIXED
  const io = req.app.get('io'); // get once

  const lawyers = await User.find({ role: 'lawyer' });

  for (const lawyer of lawyers) {
    const notif = new Notification({
      userId: lawyer._id,
      title: 'Document Reuploaded',
      message: `${req.user.username} reuploaded a document for land in ${land.city}.`,
      targetRole: 'lawyer',
    });

    await notif.save();

    // 🔥 SAFE SOCKET EMIT
    if (io) {
      io.to(lawyer._id.toString()).emit('receive-notification', notif);
    } else {
      console.log('⚠️ io is not available');
    }
  }

  console.log('Updated subDoc file object:', subDoc.file);

  res.status(200).json({
    message: 'Document reuploaded successfully',
    document: subDoc,
  });
});
