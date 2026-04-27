import jwt from 'jsonwebtoken';
import User from '../modals/UserModal.js';
import Land from '../modals/LandModal.js';
import Payment from '../modals/PaymentModal.js';
import asyncHandler from '../middlerwares/asyncHandler.js';
import { mongo, Types } from 'mongoose';
import calculateAverageRating from '../utils/calculateAverageRating.js';
import mongoose from 'mongoose';

import { getRequesterFromHeader } from '../utils/getRequesterheader.js';
import Document from '../modals/DocumentModal.js';
import Notification from '../modals/NotificationModal.js';
import { io } from '../index.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { compressImage } from '../utils/compressImage.js';
import fs from 'fs';
import { generateHash } from '../utils/Hash.js';
import OwnershipHistory from '../modals/ownershipHistroyModal.js';
// ----------------------------------------------

// CREATE LAND
// ----------------------------------------------
// ----------------------------------------------
// CREATE LAND (Pending lawyer approval)
// ----------------------------------------------
const createLand = asyncHandler(async (req, res) => {
  const {
    landtype,
    city,
    state,
    pincode,
    price,
    length,
    breadth,
    description,
    latitude,
    longitude,
  } = req.body;
  const { id, username } = req.user;
  const { declarationAccepted } = req.body;
  // Validation
  if (
    !landtype ||
    !city ||
    !state ||
    !pincode ||
    !price ||
    !length ||
    !breadth ||
    !description ||
    !req.file
  ) {
    console.log('❌ Validation failed:', {
      landtype,
      city,
      state,
      pincode,
      price,
      length,
      breadth,
      description,
      fileExists: !!req.file,
    });
    return res.status(400).send('All fields are required, including image!');
  }
  if (!declarationAccepted || declarationAccepted !== 'true') {
    return res.status(400).json({
      message: 'You must accept the declaration before submitting.',
    });
  }

  const dimensionsString = `${length}*${breadth}`;
  const localPath = req.file.path;

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || req.ip;

  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    //  CREATE LAND
    const land = new Land({
      landtype,
      city,
      state,
      pincode,
      price,
      dimensions: { length, breadth },
      dimensionsString,
      description,
      image: {
        cloudinary: null,
        local: localPath,
      },
      owner: id,
      ownerName: username,
      status: 'pending',
      approvedBy: null,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      declaration: {
        accepted: true,
        acceptedAt: new Date(),
        ipAddress: ip,
        userAgent: userAgent,
        version: 'v1.0',
      },
    });

    await land.save();

    const landId = land._id;

    // ==============================
    //  GENESIS BLOCK
    // ==============================
    const genesisData = {
      landId: land._id.toString(),
      owner: id.toString(),
      time: Date.now(),
    };

    const currentHash = generateHash(genesisData);

    const ownershipRecord = await OwnershipHistory.create({
      landId: land._id,
      fromOwner: id,
      fromOwnerName: username,
      toOwner: id,
      toOwnerName: username,
      transferType: 'sale',
      price,
      previousHash: '0',
      currentHash,
      blockNumber: 0,
      verified: true,
    });

    land.ownershipHistory.push(ownershipRecord._id);
    land.ownershipCount = 1;
    land.lastTransferDate = ownershipRecord.dateOfTransfer;
    await land.save();

    // ==============================
    // CLOUDINARY UPLOAD
    // ==============================
    let cloudUrl = null;

    try {
      const compressedPath = await compressImage(localPath);

      const uploadedUrl = await uploadToCloudinary(
        compressedPath,
        `lands/${id}/${landId}`,
      );

      if (uploadedUrl) {
        cloudUrl = uploadedUrl.replace('/upload/', '/upload/f_auto,q_auto/');
      } else {
        console.log('⚠️ Upload returned null');
      }

      // Cleanup compressed file
      if (compressedPath && fs.existsSync(compressedPath)) {
        fs.unlinkSync(compressedPath);
      }

      // 💾 Save cloud URL
      land.image.cloudinary = cloudUrl;
      await land.save();
    } catch (cloudErr) {
      console.log('❌ Cloudinary upload failed:');
      console.log('Message:', cloudErr.message);
      console.log('Full error:', cloudErr);
    }

    // ==============================
    // NOTIFICATIONS
    // ==============================
    const io = req.app.get('io');
    const lawyers = await User.find({ role: 'lawyer' });

    for (const lawyer of lawyers) {
      const notif = new Notification({
        userId: lawyer._id,
        title: 'Land requires review',
        message: 'A land document needs your review',
        targetRole: 'lawyer',
      });

      await notif.save();
      if (io) io.to(lawyer._id.toString()).emit('receive-notification', notif);
    }

    return res.status(201).json({
      message: 'Land submitted successfully!',
      land,
      uploadSource: cloudUrl ? 'cloudinary' : 'local',
    });
  } catch (error) {
    console.error('❌ Error in createLand:', error);
    return res.status(500).send('Server error');
  }
});

// Upload documents

const uploadDocuments = async (req, res) => {
  try {
    const { landId } = req.params;

    const land = await Land.findById(landId);
    if (!land) return res.status(404).json({ message: 'Land not found' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const documentsArray = [];

    for (let file of req.files) {
      let cloudUrl = null;

      try {
        let uploadPath = file.path;

        // Compress only land photos
        if (file.fieldname === 'LandPhotos') {
          uploadPath = await compressImage(file.path);
        }

        const uploaded = await uploadToCloudinary(
          uploadPath,
          `lands/${req.user.id}/${landId}/documents`,
        );

        if (uploaded) {
          cloudUrl = uploaded.replace('/upload/', '/upload/f_auto,q_auto/');
        }

        //  Cleanup
        if (uploadPath !== file.path && fs.existsSync(uploadPath)) {
          fs.unlinkSync(uploadPath);
        }
      } catch (err) {
        console.log('❌ Cloudinary doc upload failed:');
        console.log('Message:', err.message);
      }

      documentsArray.push({
        type: file.fieldname,
        file: {
          local: file.path,
          cloudinary: cloudUrl,
        },
      });
    }

    const newDocument = new Document({
      land: land._id,
      owner: req.user.id,
      documents: documentsArray,
    });

    await newDocument.save();

    land.documents.push(newDocument._id);
    await land.save();

    //  Notifications
    const io = req.app.get('io');
    const lawyers = await User.find({ role: 'lawyer' });

    for (const lawyer of lawyers) {
      const notif = new Notification({
        userId: lawyer._id,
        title: 'New Document Uploaded',
        message: `${req.user.username} uploaded documents for land in ${land.city}.`,
        targetRole: 'lawyer',
      });

      await notif.save();
      if (io) io.to(lawyer._id.toString()).emit('receive-notification', notif);
    }

    res.status(200).json({
      message: 'Documents uploaded successfully!',
      documentId: newDocument._id,
      uploadMode: 'hybrid',
    });
  } catch (error) {
    console.error('❌ Error uploading documents:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ----------------------------------------------
// GET ALL LANDS (Updated with calculateAverageRating)
// ----------------------------------------------
const getAllLands = asyncHandler(async (req, res) => {
  try {
    const requester = getRequesterFromHeader(req);
    let lands;

    if (requester?.role === 'lawyer') {
      // ✅ Lawyer sees ALL lands
      lands = await Land.find({})
        .populate({
          path: 'approvedBy',
          model: 'User',
          select: 'username',
        })
        .populate({
          path: 'assignedLawyer',
          model: 'User',
          select: 'username',
        })
        .populate({
          path: 'owner',
          model: 'User',
          select: 'username',
        })
        .populate({
          path: 'documents',
          populate: { path: 'documents' },
        });
    } else {
      // ✅ Normal users see ONLY approved lands
      lands = await Land.find({ status: 'approved' })
        .populate({
          path: 'approvedBy',
          model: 'User',
          select: 'username',
        })
        .populate({
          path: 'owner',
          model: 'User',
          select: 'username',
        })
        .populate({
          path: 'documents',
          populate: { path: 'documents' },
        });
    }

    // ✅ Convert + add rating
    const landsWithAverageRating = lands.map((land) => ({
      ...land.toObject(),
      averageRating: calculateAverageRating(land.reviews),
    }));

    return res.status(200).json({ data: landsWithAverageRating });
  } catch (error) {
    console.error('Error fetching lands:', error);
    return res.status(500).send('Error fetching land data');
  }
});

// ----------------------------------------------
// REPLACEMENT: GET LAND BY ID
// GET LAND BY ID (UPDATED FULLY)
const getLandById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid land ID.' });
  }

  const land = await Land.findById(id)
    .populate('reviews.user', 'username')
    .populate('approvedBy', 'username');

  if (!land) return res.status(404).json({ message: 'Land not found.' });

  // Determine requester (works for both logged-in and header token)
  let requester = null;
  if (req.user) {
    requester = { id: req.user._id?.toString(), role: req.user.role };
  } else {
    const decoded = getRequesterFromHeader(req);
    if (decoded) {
      requester = {
        id: (decoded.userId || decoded.id || decoded._id || '').toString(),
        role: decoded.role,
      };
    }
  }

  const averageRating = calculateAverageRating(land.reviews);

  // -------------------------------------------------------
  // 🔥 FETCH DOCUMENTS (for lawyer & owner only)
  // -------------------------------------------------------
  const fetchDocuments = async () => {
    const documentCollections = await Document.find({ land: land._id }).lean();

    return documentCollections.flatMap((dc) =>
      (dc.documents || []).map((d) => ({
        _id: dc._id, // DocumentModel ID (for approval/rejection API)
        type: d.type,
        file: d.file,
        uploadedAt: d.uploadedAt,
        status: dc.status, // pending / approved / rejected
      })),
    );
  };

  // -------------------------------------------------------
  // Lawyer access — full visibility
  // -------------------------------------------------------
  if (requester?.role === 'lawyer') {
    const docs = await fetchDocuments();

    return res.status(200).json({
      ...land.toObject(),
      averageRating,
      documents: docs,
    });
  }

  // -------------------------------------------------------
  // Owner access — must also see documents & statuses
  // -------------------------------------------------------
  if (requester?.id && land.owner?.toString() === requester.id) {
    const docs = await fetchDocuments();

    return res.status(200).json({
      ...land.toObject(),
      averageRating,
      documents: docs,
    });
  }

  // -------------------------------------------------------
  // Buyer/public access — ONLY approved land, NO documents
  // -------------------------------------------------------
  // Buyer/public access — show only land photos
  // Buyer/public access — ONLY approved land, ONLY land photos
  if (
    requester?.role !== 'owner' &&
    requester?.role !== 'lawyer' &&
    land.status === 'approved'
  ) {
    const docs = await fetchDocuments();

    // Filter only documents with type "land photo"
    const landPhotos = docs.filter((d) => d.type === 'LandPhotos');

    return res.status(200).json({
      ...land.toObject(),
      averageRating,
      documents: landPhotos, // Only land photos sent
    });
  }

  return res.status(403).json({ message: 'You are not authorized to view this land.' });
});

// api for reconsider button shown to user
const resubmitLand = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid land ID' });
  }

  const land = await Land.findById(id);
  if (!land) return res.status(404).json({ message: 'Land not found' });

  if (String(land.owner) !== String(req.user.id)) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  if (land.status !== 'rejected') {
    return res.status(400).json({ message: 'Only rejected land can be resubmitted' });
  }

  console.log('\n=== RESUBMISSION STARTED ===');

  // 1️⃣ Reset land status
  land.status = 'pending';
  land.rejectionReason = '';

  // 2️⃣ Loop through each linked Document collection record
  for (const docRef of land.documents) {
    const docRecord = await Document.findById(docRef._id);

    if (!docRecord) continue;

    console.log(`Processing Document Record: ${docRecord._id}`);

    let changed = false;

    docRecord.documents.forEach((singleDoc) => {
      if (singleDoc.status === 'rejected') {
        console.log(`→ resetting ${singleDoc._id} rejected → pending`);
        singleDoc.status = 'pending';
        changed = true;
      }
    });

    if (changed) {
      await docRecord.save();
      console.log(`✔ Saved updates in Document Record ${docRecord._id}`);
    } else {
      console.log(`⚠ No rejected files inside Document Record ${docRecord._id}`);
    }
  }

  // 3️⃣ Save land
  await land.save();
  const assignedLawyers = await User.find({ role: 'lawyer' }); // get all lawyers

  assignedLawyers.forEach(async (lawyer) => {
    const notif = new Notification({
      userId: lawyer._id,
      title: 'Land Resubmitted',
      message: `${req.user.username} has resubmitted the land in ${land.city}.`,
      targetRole: 'lawyer',
    });

    await notif.save();
    io.to(lawyer._id.toString()).emit('receive-notification', notif);
  });

  console.log('✔ Land saved and all rejected documents reset\n');

  res.json({
    message: 'Land resubmitted. All rejected documents reset to pending.',
  });
});

//showcasing lands for lawywer in myland
const getLawyerLands = async (req, res) => {
  try {
    const { lawyerId } = req.params;

    const lands = await Land.find({
      $or: [{ assignedLawyer: lawyerId }, { approvedBy: lawyerId }],
    })
      .populate('owner', 'username')
      .sort({ updatedAt: -1 });

    res.status(200).json(lands);
  } catch (err) {
    console.error('Error fetching lawyer lands:', err);
    res.status(500).json({ message: 'Failed to fetch lawyer lands' });
  }
};

// ----------------------------------------------
// GET LAND BY USER ID (Updated with averageRating)
// ----------------------------------------------
const getLandsByUser = async (req, res) => {
  try {
    const { username } = req.params;

    const lands = await Land.find({ ownerName: username });

    if (!lands || lands.length === 0) {
      return res.status(200).json({ message: 'No lands found for this user.' });
    }

    const landsWithRatings = lands.map((land) => ({
      ...land.toObject(),
      averageRating: calculateAverageRating(land.reviews),
    }));

    res.status(200).json(landsWithRatings);
  } catch (error) {
    console.error('Error fetching lands:', error);
    res.status(500).json({ message: 'Server error while fetching lands.' });
  }
};

// ----------------------------------------------
const updateLandsBySameUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { username } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send('unexpected error occured');
    }

    const filteredLands = await Land.updateMany(
      {
        owner: userId,
      },
      {
        $set: { ownerName: username || ownerName },
      },
    );

    res.status(200).json({ filteredLands });
  } catch (error) {
    res.status(500).send({ message: 'error ocuured' });
  }
});

// ----------------------------------------------
// UPDATE LAND
// ----------------------------------------------
const updateLandById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid land ID.' });
  }

  const land = await Land.findById(id);
  if (!land) {
    return res.status(404).json({ message: 'Land not found!' });
  }

  try {
    const {
      landtype,
      city,
      pincode,
      state,
      owner,
      price,
      tokenPercentage,
      dimensions,
      dimensionsString,
      description,
    } = req.body;

    // ================= BASIC FIELDS =================
    land.landtype = landtype || land.landtype;
    land.city = city || land.city;
    land.state = state || land.state;
    land.pincode = pincode || land.pincode;
    land.description = description || land.description;

    // ================= PRICE =================
    if (price !== undefined) {
      const p = Number(price);
      land.price = Number.isNaN(p) ? land.price : p;
    }

    // ================= TOKEN CONFIG =================
    if (tokenPercentage !== undefined) {
      const percent = Number(tokenPercentage);

      if (isNaN(percent) || percent <= 0 || percent > 20) {
        return res.status(400).json({
          message: "Token percentage must be between 1% and 20%",
        });
      }

      // prevent changes if locked
      if (land.tokenConfig?.editable === false) {
        return res.status(400).json({
          message: "Token configuration is locked and cannot be changed",
        });
      }

      land.tokenConfig.percentage = percent;

      // always calculate from latest price
      land.tokenConfig.amount = (land.price * percent) / 100;

      land.tokenConfig.setByOwner = true;
    }

    // ================= DIMENSIONS =================
    if (dimensions && typeof dimensions === 'string') {
      const cleaned = dimensions.replace(/\s+/g, '');
      const sepMatch = cleaned.match(/(\d+)[\*xX](\d+)/);

      if (!sepMatch) {
        return res.status(400).json({ message: 'Invalid dimensions format!' });
      }

      land.dimensions = {
        length: Number(sepMatch[1]),
        breadth: Number(sepMatch[2]),
      };

      land.dimensionsString = dimensions;
    }

    // ================= OWNER CHANGE =================
    if (owner) {
      const checkOwner = await User.find({ username: owner });

      if (!checkOwner.length) {
        return res.status(400).json({ message: 'User not found' });
      }

      land.owner = checkOwner[0]._id;
      land.ownerName = checkOwner[0].username;
    }

    // ================= SAVE =================
    const updatedLand = await land.save();
    return res.status(200).json(updatedLand);

  } catch (err) {
    console.error('Error updating land:', err);
    return res.status(500).json({
      message: 'Server error while updating land.',
    });
  }
});

// ----------------------------------------------
// DELETE LAND
// ----------------------------------------------
const deleteLandById = asyncHandler(async (req, res) => {
  const landId = req.params.id;

  if (landId) {
    await Land.findByIdAndDelete(landId);
    res.status(200).send('Land successfully removed!');
  } else {
    res.status(400).send('Land not found');
  }
});

// ----------------------------------------------
// GET LANDS BY USERNAME (UPDATED WITH averageRating)
// ----------------------------------------------

// ----------------------------------------------
const getLandReviews = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id).populate('reviews.user', 'username');

    if (!land) {
      return res.status(404).json({ message: 'Land not found' });
    }

    res.status(200).json(land.reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
//create review
const createReview = asyncHandler(async (req, res) => {
  const { id: landId } = req.params;
  const { review, rating } = req.body;
  const userId = req.user.id;

  const land = await Land.findById(landId);
  if (!land) return res.status(404).json({ message: 'Land not found' });

  // Make sure to include username
  const newReview = {
    user: userId,
    username: req.user.username, // ✅ add this
    review,
    rating,
    createdAt: new Date(),
  };

  land.reviews.push(newReview);
  await land.save();

  // Notify owner
  const ownerNotification = new Notification({
    userId: land.owner,
    title: 'New Review Received',
    message: `${req.user.username} has posted a review for your land in ${land.city}.`,
    targetRole: 'owner',
  });
  await ownerNotification.save();
  io.to(land.owner.toString()).emit('receive-notification', ownerNotification);

  res.status(201).json({ createdReview: newReview });
});

// ----------------------------------------------
const deleteReview = async (req, res) => {
  try {
    const { landId, userId } = req.params;

    if (req.user.id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own review.' });
    }

    const land = await Land.findById(landId);
    if (!land) return res.status(404).json({ message: 'Land not found.' });

    const index = land.reviews.findIndex((review) => review.user.toString() === userId);

    if (index === -1) return res.status(404).json({ message: 'Review not found.' });

    land.reviews.splice(index, 1);
    await land.save();
    const ownerNotification = new Notification({
      userId: land.owner,
      title: 'Review Deleted',
      message: `${req.user.username} has deleted their review for your land in ${land.city}.`,
      targetRole: 'owner',
    });
    await ownerNotification.save();

    io.to(land.owner.toString()).emit('receive-notification', ownerNotification);

    res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ----------------------------------------------
const getLandByType = asyncHandler(async (req, res) => {
  const { landtype } = req.params;

  if (!landtype) return res.status(400).json({ message: 'Land type is required' });

  try {
    let lands;
    if (req.user && req.user.role === 'lawyer') {
      lands = await Land.find({ landtype: { $regex: new RegExp(`^${landtype}$`, 'i') } });
    } else {
      lands = await Land.find({
        landtype: { $regex: new RegExp(`^${landtype}$`, 'i') },
        status: 'approved',
      });
    }

    if (!lands.length) {
      return res.status(404).json({ message: `No lands found for type: ${landtype}` });
    }

    res.status(200).json(lands);
  } catch (error) {
    console.error('Error fetching lands by type:', error);
    res.status(500).json({ message: 'Server error while fetching lands' });
  }
});

const getLandByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid User ID' });
  }

  const alllands = await Land.find({ owner: userId });

  let lands;
  if (req.user && req.user.role === 'lawyer') {
    lands = alllands; // Lawyer sees all lands
  } else {
    lands = alllands.filter((land) => land.status === 'approved'); // Normal users only approved lands
  }

  if (!lands.length) {
    return res.status(404).json({ message: 'No lands found for this user' });
  }

  const landsWithRatings = lands.map((land) => ({
    ...land.toObject(),
    averageRating: calculateAverageRating(land.reviews),
  }));

  res.status(200).json({ data: landsWithRatings });
});

// GET ALL CITIES WITH VERIFIED LANDS
// ----------------------------------------------
const getCitiesWithVerifiedLands = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching cities with verified lands...');

    // Find all approved (lawyer verified) lands and extract unique cities
    const verifiedLands = await Land.find({
      status: 'approved',
    })
      .select('city state')
      .lean();

    if (!verifiedLands.length) {
      return res.status(404).json({
        message: 'No verified lands found',
        cities: [],
      });
    }

    // Extract unique cities with their states
    const cityStateMap = new Map();

    verifiedLands.forEach((land) => {
      if (land.city && land.state) {
        const cityKey = land.city.toLowerCase().trim();
        const stateKey = land.state.toLowerCase().trim();

        if (!cityStateMap.has(cityKey)) {
          cityStateMap.set(cityKey, {
            city: land.city,
            state: land.state,
            landCount: 0,
          });
        }
        cityStateMap.get(cityKey).landCount++;
      }
    });

    // Convert to array and sort by city name
    const citiesWithStates = Array.from(cityStateMap.values()).sort((a, b) =>
      a.city.localeCompare(b.city),
    );

    console.log(`Found ${citiesWithStates.length} cities with verified lands`);

    res.status(200).json({
      message: 'Cities fetched successfully',
      cities: citiesWithStates,
      totalCities: citiesWithStates.length,
    });
  } catch (error) {
    console.error('Error fetching cities with verified lands:', error);
    res.status(500).json({
      message: 'Server error while fetching cities',
      error: error.message,
    });
  }
});

// mark land as interested
const markInterested = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const landId = req.params.landId;

    if (!userId || !landId) {
      return res.status(400).json({
        message: 'User ID and Land ID are required',
      });
    }

    const land = await Land.findById(landId);
    if (!land) {
      return res.status(404).json({
        message: 'Land not found',
      });
    }

    // Check if user already marked interest
    const alreadyInterested = land.interestedUsers.some(
      (item) => item.user.toString() === userId.toString(),
    );

    if (alreadyInterested) {
      return res.status(400).json({
        message: 'User already interested in this land',
      });
    }

    // Push the full object with user reference
    land.interestedUsers.push({
      user: userId,
      status: 'pending',
      createdAt: new Date(),
    });

    // Update count
    land.interestedUsersCount = land.interestedUsers.length;

    await land.save();

    // Populate user info before sending response
    await land.populate({
      path: 'interestedUsers.user',
      select: 'username fullName',
    });

    res.status(200).json({
      message: 'Land marked as interested successfully',
      interestedUsers: land.interestedUsers, // now includes username & fullName
      count: land.interestedUsers.length,
    });
  } catch (error) {
    console.error('Error marking land as interested:', error);
    res.status(500).json({
      message: 'Server error while marking land as interested',
      error: error.message,
    });
  }
});

const unmarkInterested = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const landId = req.params.landId;

    if (!userId || !landId) {
      return res.status(400).json({
        message: 'User ID and Land ID are required',
      });
    }

    const land = await Land.findById(landId);
    if (!land) {
      return res.status(404).json({
        message: 'Land not found',
      });
    }

    // ✅ FIX: check inside object
    const interested = land.interestedUsers.some(
      (item) => item.user.toString() === userId.toString(),
    );

    if (!interested) {
      return res.status(400).json({
        message: 'User not interested in this land',
      });
    }

    // ✅ FIX: filter objects
    land.interestedUsers = land.interestedUsers.filter(
      (item) => item.user.toString() !== userId.toString(),
    );

    land.interestedUsersCount = land.interestedUsers.length;

    await land.save();

    res.status(200).json({
      message: 'Land unmarked as interested successfully',
      interestedUsers: land.interestedUsers, // full array of objects
      count: land.interestedUsers.length,
    });
  } catch (error) {
    console.error('Error unmarking land as interested:', error);
    res.status(500).json({
      message: 'Server error while unmarking land as interested',
      error: error.message,
    });
  }
});

const getInterestedUsers = asyncHandler(async (req, res) => {
  try {
    const landId = req.params.landId;

    if (!landId) {
      return res.status(400).json({
        message: 'Land ID is required',
      });
    }

    const land = await Land.findById(landId).populate(
      'interestedUsers.user',
      '-password',
    );

    if (!land) {
      return res.status(404).json({
        message: 'Land not found',
      });
    }

    // ✅ FIX: map properly
    const interestedUsersDetails = land.interestedUsers.map((item) => ({
      user: item.user,
      status: item.status,
      createdAt: item.createdAt,
    }));

    res.status(200).json({
      message: 'Interested users fetched successfully',
      interestedUsers: interestedUsersDetails,
      count: interestedUsersDetails.length,
    });
  } catch (error) {
    console.error('Error fetching interested users:', error);
    res.status(500).json({
      message: 'Server error while fetching interested users',
      error: error.message,
    });
  }
});
//update the intrest sattus either approve or reject
//  const updateInterestStatus = async (req, res) => {
//   try {
//     const { landId, userId, action } = req.body;

//     const land = await Land.findById(landId);

//     if (!land) {
//       return res.status(404).json({ message: "Land not found" });
//     }

//     const entry = land.interestedUsers.find(
//       (item) => item.user.toString() === userId
//     );

//     if (!entry) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // ACCEPT
//     if (action === "accepted") {
//       land.selectedBuyer = userId;

//       land.interestedUsers.forEach((item) => {
//         if (item.user.toString() === userId) {
//           item.status = "accepted";
//         } else {
//           item.status = "rejected";
//         }
//       });
//     }

//     // REJECT
//     if (action === "rejected") {
//       entry.status = "rejected";
//     }

//     await land.save();

//     res.status(200).json({
//       message: `User ${action} successfully`,
//       interestedUsers: land.interestedUsers,
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
//to get the ownership table
const getLandDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    const land = await Land.findById(id)
      .populate("ownershipHistory")
      .populate("tokenBuyer")
      .populate({
        path: "interestedUsers.user",
        select: "username _id",
      });

    if (!land) {
      return res.status(404).json({ msg: "Land not found" });
    }

    // =========================
    // CURRENT OWNER
    // =========================
    const currentOwner = land.owner;

    // =========================
    // LAST TRANSFER
    // =========================
    const lastTransfer =
      land.ownershipHistory?.[land.ownershipHistory.length - 1];

    // =========================
    // USER ID (FROM AUTH MIDDLEWARE)
    // =========================
    const currentUserId = req.user?._id;

    // =========================
    // TOKEN BUYER (FROM LAND)
    // =========================
    const tokenBuyer = land.tokenBuyer || null;

    // =========================
    // TOKEN ACCESS CHECK (BASED ON LAND)
    // =========================
    const hasTokenAccess =
      currentUserId &&
      tokenBuyer &&
      String(currentUserId) === String(tokenBuyer);

    // =========================
    // RESPONSE
    // =========================
    res.json({
      land,

      currentOwner,

      lastTransferDate: land.lastTransferDate,

      ownershipHistory: land.ownershipHistory,

      interests: land.interestedUsers,

      // 🔥 IMPORTANT FIX
      tokenBuyer,

      hasTokenAccess,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
//geo verifiacation api
const geoVerifyLand = async (req, res) => {
  try {
    const { lat, lng, note, statusOverride } = req.body; // <-- include override
    const land = await Land.findById(req.params.id);

    if (!land) {
      return res.status(404).json({ message: 'Land not found' });
    }

    const [ownerLng, ownerLat] = land.location.coordinates;

    // Haversine Formula
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;

      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const distance = getDistance(ownerLat, ownerLng, lat, lng);

    // If lawyer overrides, use it; otherwise use system-calculated status
    const status =
      statusOverride && ['matched', 'mismatched'].includes(statusOverride)
        ? statusOverride
        : distance < 0.1
          ? 'matched'
          : 'mismatched'; // 0.1 km = 100m threshold

    land.geoVerification = {
      lawyerCoordinates: [lng, lat],
      status,
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      distance,
      note: note || '',
    };

    await land.save();

    res.json({
      message: 'Geo verification completed',
      geoVerification: land.geoVerification,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Geo verification failed' });
  }
};
//lawyer declaration
const saveLawyerDeclaration = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);

    if (!land) {
      return res.status(404).json({ message: 'Land not found' });
    }
    if (land.geoVerification?.lawyerDeclaration?.accepted) {
      return res.status(400).json({
        message: 'Declaration already submitted',
      });
    }

    // ✅ Ensure geoVerification exists
    if (!land.geoVerification) {
      land.geoVerification = {};
    }

    // ✅ UPDATE CORRECT FIELD
    land.geoVerification.lawyerDeclaration = {
      accepted: true,
      acceptedAt: new Date(),
      lawyerId: req.user._id,
    };

    await land.save();

    res.json({
      message: 'Declaration saved',
      lawyerDeclaration: land.geoVerification.lawyerDeclaration,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save declaration' });
  }
};

// ----------------------------------------------
export {
  createLand,
  getAllLands,
  getLandById,
  getLandByUserId,
  updateLandById,
  deleteLandById,
  getLandReviews,
  getLandsByUser,
  getLandByType,
  deleteReview,
  updateLandsBySameUser,
  uploadDocuments,
  resubmitLand,
  createReview,
  getLawyerLands,
  getCitiesWithVerifiedLands,
  markInterested,
  unmarkInterested,
  getInterestedUsers,
  getLandDashboard,
  geoVerifyLand,
  saveLawyerDeclaration,
  // updateInterestStatus,
};
