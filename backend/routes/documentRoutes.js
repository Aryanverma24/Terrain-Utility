import express from 'express';
import multer from 'multer';
import Land from '../modals/LandModal.js';
import { authenticate } from '../middlerwares/landauthenticate.js';
// import { uploadDocuments } from "../controllers/documentController.js";
import path from 'path';
import { uploadAny } from '../middlerwares/multer.js';
import Document from '../modals/DocumentModal.js';
import { roleAuth } from '../middlerwares/roleAuth.js';
import Notification from '../modals/NotificationModal.js';
import User from '../modals/UserModal.js';
import asyncHandler from '../middlerwares/asyncHandler.js';
const router = express.Router();
import upload from '../utils/multerConfig.js';
import { io } from '../index.js';
import { reuploadDocumentHandler } from '../controllers/documentController.js';
// Multer setup for file uploads

// router.post(
//   "/api/documents/upload/:landId",
//   authenticate,
//   uploadAny,
//   uploadDocuments
// );
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Only lawyers can update document status
// Update status of a single document inside a collection
// PUT /api/documents/file/:subDocId/:status
router.put(
  '/file/:subDocId/:status',
  asyncHandler(async (req, res) => {
    const { subDocId, status } = req.params;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const parentDoc = await Document.findOne({ 'documents._id': subDocId });

    if (!parentDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // ✅ SAFE UPDATE (NO VALIDATION BREAK)
    await Document.updateOne(
      { 'documents._id': subDocId },
      {
        $set: {
          'documents.$.status': status,
        },
      },
    );

    // Get updated subdoc (optional)
    const updatedDoc = await Document.findOne(
      { 'documents._id': subDocId },
      { 'documents.$': 1 },
    );

    const subDoc = updatedDoc.documents[0];

    // 🔔 Notification
    const notification = await Notification.create({
      userId: parentDoc.owner,
      title: `Document ${status}`,
      message: `Your document "${subDoc.type}" was ${status} by the lawyer.`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(parentDoc.owner.toString()).emit('new-notification', notification);
    }

    res.status(200).json({
      message: 'Document status updated',
      document: subDoc,
    });
  }),
);

// Reupload a rejected document
router.put(
  '/:docId/reupload',
  authenticate,
  upload.single('file'),
  reuploadDocumentHandler,
);

export default router;
