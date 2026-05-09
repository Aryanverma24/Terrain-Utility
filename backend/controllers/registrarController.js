import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Registrar from '../modals/registrarModal.js';
import Land from '../modals/LandModal.js';
import Document from '../modals/DocumentModal.js';
import userDocumentModal from '../modals/userDocumentModal.js';
import Appointment from '../modals/AppointmentModal.js';
//registrar activation and login
// First Time Activation
export const activateRegistrar = async (req, res) => {
  try {
    const { uniqueId, officialEmail, password, confirmPassword } = req.body;

    // validations
    if (!uniqueId || !officialEmail || !password || !confirmPassword) {
      return res.status(400).json({
        message: 'All fields required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Passwords do not match',
      });
    }

    // find preloaded registrar
    const registrar = await Registrar.findOne({
      registrarUniqueId: uniqueId,
      officialEmail: officialEmail.toLowerCase(),
    });

    if (!registrar) {
      return res.status(404).json({
        message: 'Registrar record not found',
      });
    }

    // already activated
    if (registrar.isActivated) {
      return res.status(400).json({
        message: 'Account already activated. Please login.',
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // activate account
    registrar.password = hashedPassword;
    registrar.isActivated = true;
    registrar.activatedAt = new Date();

    await registrar.save();

    res.status(200).json({
      success: true,
      message: 'Registrar account activated successfully',
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Server error',
    });
  }
};

//login registrar
export const loginRegistrar = async (req, res) => {
  try {
    const { uniqueId, password } = req.body;

    // validations
    if (!uniqueId || !password) {
      return res.status(400).json({
        message: 'Please provide credentials',
      });
    }

    // find registrar
    const registrar = await Registrar.findOne({
      registrarUniqueId: uniqueId,
    });

    if (!registrar) {
      return res.status(404).json({
        message: 'Registrar not found',
      });
    }

    // activated?
    if (!registrar.isActivated) {
      return res.status(403).json({
        message: 'Activate account first',
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, registrar.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // update login time
    registrar.lastLogin = new Date();

    await registrar.save();

    // token
    const token = jwt.sign(
  {
    userId: registrar._id,
role: 'registrar',
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '7d',
  },
);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,

      registrar: {
        id: registrar._id,
        name: registrar.registrarName,
        office: registrar.officeName,
        role: 'registrar',
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Server error',
    });
  }
};
/**
 *Auto-assign nearest registrar to land (geo-based)
 * This is the FIRST step of appointment workflow
 */
export const assignRegistrarToLand = async (req, res) => {
  try {

    const { landId } = req.body;

    if (!landId) {
      return res.status(400).json({
        success: false,
        msg: "landId is required"
      });
    }

    const land = await Land.findById(landId);

    if (!land) {
      return res.status(404).json({
        success: false,
        msg: "Land not found",
      });
    }

    const registrar = await Registrar.findOne({
      status: "active",
    });

    if (!registrar) {
      return res.status(404).json({
        success: false,
        msg: "No registrar available",
      });
    }

    land.assignedRegistrar = registrar._id;

    await land.save();

    return res.json({
      success: true,
      message: "Registrar assigned successfully",
      registrar,
    });

  } catch (err) {

    console.error("ASSIGN ERROR:", err);

    return res.status(500).json({
      success: false,
      msg: err.message,
    });

  }
};
//for documents 


export const getRegistrarAppointmentDocuments = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate("buyer")
      .populate({
        path: "land",
        populate: {
          path: "owner",
        },
      });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    /* =========================
       LAND DOCUMENTS (FIXED)
    ========================== */

    const landDocIds = appointment.land?.documents || [];

    const landDocParents = await Document.find({
      _id: { $in: landDocIds },
    });

    // flatten sub-documents
    const landDocs = landDocParents.flatMap((doc) =>
      doc.documents.map((sub) => ({
        ...sub.toObject(),
        parentId: doc._id,
      }))
    );

    /* =========================
       BUYER DOCUMENTS
    ========================== */

    const buyerDocData = await userDocumentModal.findOne({
      user: appointment.buyer._id,
    });

    const buyerDocs = buyerDocData?.documents || [];

    /* =========================
       OWNER DOCUMENTS
    ========================== */

    const ownerDocData = await userDocumentModal.findOne({
      user: appointment.land.owner?._id,
    });

    const ownerDocs = ownerDocData?.documents || [];

    return res.json({
      success: true,
      landDocs,
      buyerDocs,
      ownerDocs,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};