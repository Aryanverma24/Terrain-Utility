import Mutation from "../modals/mutationModal.js";
import Appointment from "../modals/AppointmentModal.js";
import Land from "../modals/LandModal.js";
import crypto from "crypto";
import OwnershipHistory from "../modals/ownershipHistroyModal.js";
import { addAuditLog } from "../utils/Auditlog.js";
export const initiateMutation = async (req, res) => {

  try {

    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate("buyer")
      
      .populate({
        path: "land",
        populate: {
          path: "owner"
        }
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    /* ===================================
       CHECK REGISTRATION COMPLETED
    =================================== */

    if (appointment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Registration not completed yet"
      });
    }

    /* ===================================
       PREVENT DUPLICATE MUTATION
    =================================== */

    const existing = await Mutation.findOne({
      appointment: appointment._id
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Mutation already initiated"
      });
    }

    /* ===================================
       GENERATE MUTATION NUMBER
    =================================== */

    const mutationNumber =
      `MUT-${Date.now()}`;

    /* ===================================
       AUTO GENERATE DRAFT
    =================================== */

    const draft = `
Mutation Record

Mutation Number: ${mutationNumber}

Land ID: ${appointment.land._id}

Property Location:
${appointment.land.city}, ${appointment.land.state}

Previous Owner:
${appointment.land.owner.username}

New Owner:
${appointment.buyer.username}

Registrar:
${req.user.username}

Transaction Amount:
₹${appointment.land.price}

Mutation initiated for ownership transfer
after successful registration execution.

Status: INITIATED
`;

    /* ===================================
       CREATE MUTATION
    =================================== */

    const mutation = await Mutation.create({

      appointment: appointment._id,

      land: appointment.land._id,

      seller: appointment.land.owner._id,

      buyer: appointment.buyer._id,

      registrar: req.user._id,

      mutationNumber,

      mutationDraft: draft,

      mutationStatus: "initiated",
    });

    /* ===================================
       UPDATE LAND STATUS
    =================================== */

    appointment.land.transferStatus =
      "mutation_pending";

    await appointment.land.save();
await addAuditLog({
  landId: appointment.land._id,
  action: "Mutation Initiated",
  description:
    `Mutation process started (${mutationNumber})`,
  user: req.user,
});
    res.status(201).json({
      success: true,
      message: "Mutation initiated successfully",
      mutation,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



export const approveMutation = async (req, res) => {

  try {

    const mutation = await Mutation.findById(req.params.id)
      .populate("buyer")
      .populate("seller")
      .populate("land");

    if (!mutation) {
      return res.status(404).json({
        success: false,
        message: "Mutation not found"
      });
    }

    mutation.mutationStatus = "approved";
    mutation.approvedAt = new Date();

    /* ===================================
       TRANSFER OWNERSHIP
    =================================== */

    mutation.land.owner = mutation.buyer._id;

    mutation.land.ownerName =
      mutation.buyer.username;

    mutation.land.transferStatus =
      "transferred";

    mutation.land.isLocked = false;

    mutation.land.lastTransferDate =
      new Date();

    await mutation.land.save();
await addAuditLog({
  landId: mutation.land._id,
  action: "Mutation Approved",
  description:
    "Mutation approved and ownership transfer validated",
  user: req.registrar,
});
    mutation.completedAt = new Date();
    mutation.mutationStatus = "completed";

    await mutation.save();

    res.json({
      success: true,
      message: "Mutation approved successfully",
      mutation
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
export const getPendingMutationsForRegistrar = async (req, res) => {
  try {

    const mutations = await Mutation.find({
      mutationStatus: {
        $in: [
          "initiated",
          "under_review",
        ]
      }
    })
      .populate("buyer", "username")
      .populate("seller", "username")
      .populate("land", "landtype")
      .sort({ createdAt: -1 });

   res.status(200).json({
  success: true,
  mutations
});

  } catch (error) {

    console.error(
      "GET PENDING MUTATIONS ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch mutations"
    });
  }
};
//to get the mutationslist based on the appointments in workbench 
export const getMutationByAppointment = async (req, res) => {
  try {
   const mutation = await Mutation.findOne({
  appointment: req.params.appointmentId
})
.populate("seller", "username name email")
.populate("buyer", "username name email")
.populate("registrar", "registrarName")
.populate("land");

    return res.json({
      success: true,
      mutation
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
//sign from registrar 
export const signMutation = async (req, res) => {
  try {

    const mutation = await Mutation.findById(req.params.id);

    if (!mutation) {
      return res.status(404).json({
        success: false,
        message: "Mutation not found"
      });
    }

    const crypto = await import("crypto");

    const hash = crypto
      .createHash("sha256")
      .update(
        mutation._id.toString() +
        mutation.mutationNumber +
        req.registrar._id.toString()
      )
      .digest("hex");

    mutation.digitalSignature = {
      hash,
      signedBy: req.registrar._id,
      signedAt: new Date()
    };

    mutation.mutationStatus = "approved";

    await mutation.save();
await addAuditLog({
  landId: mutation.land,
  action: "Digital Signature Applied",
  description:
    "Registrar digitally signed mutation records",
  user: req.registrar,
});
    return res.json({
      success: true,
      message: "Mutation signed successfully",
      hash
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
//the final land transfer 
export const finalizeTransfer = async (req, res) => {

  try {

    console.log("\n🔥 ===== FINALIZE TRANSFER STARTED =====");

    console.log("📌 Appointment ID:", req.params.id);

    /* ===============================
       APPOINTMENT
    =============================== */

    const appointment = await Appointment.findById(
      req.params.id
    );

    console.log("📌 APPOINTMENT:", appointment);

    if (!appointment) {

      console.log("❌ Appointment not found");

      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    /* ===============================
       MUTATION
    =============================== */

    const mutation = await Mutation.findOne({
      appointment: appointment._id
    })
      .populate("buyer", "username")
      .populate("seller", "username");

    console.log("📌 MUTATION:", mutation);

    if (!mutation) {

      console.log("❌ Mutation not found");

      return res.status(404).json({
        success: false,
        message: "Mutation not found"
      });
    }

    console.log("📌 Mutation Status:", mutation.mutationStatus);
    console.log("📌 Mutation Locked:", mutation.isLocked);

    if (mutation.isLocked) {

      console.log("❌ Mutation already locked");

      return res.status(400).json({
        success: false,
        message: "Mutation already finalized"
      });
    }

    if (mutation.mutationStatus !== "approved") {

      console.log("❌ Mutation not approved");

      return res.status(400).json({
        success: false,
        message: "Mutation approval pending"
      });
    }

    /* ===============================
       LAND
    =============================== */

    const land = await Land.findById(
      appointment.land
    );

    console.log("📌 LAND:", land);

    if (!land) {

      console.log("❌ Land not found");

      return res.status(404).json({
        success: false,
        message: "Land not found"
      });
    }

    /* ===============================
       PREVIOUS BLOCK
    =============================== */

    const previousRecord =
      await OwnershipHistory.findOne({
        landId: land._id
      })
      .sort({ createdAt: -1 });

    console.log(
      "📌 Previous Ownership Record:",
      previousRecord
    );

    const previousHash =
      previousRecord?.currentHash || "0";

    const blockNumber =
      previousRecord
        ? previousRecord.blockNumber + 1
        : 0;

    console.log("📌 Previous Hash:", previousHash);
    console.log("📌 Block Number:", blockNumber);

    /* ===============================
       HASH GENERATION
    =============================== */

    const rawData = `
      ${land._id}
      ${mutation.seller._id}
      ${mutation.buyer._id}
      ${Date.now()}
      ${previousHash}
      ${blockNumber}
    `;

    console.log("📌 RAW HASH DATA:", rawData);

    const currentHash = crypto
      .createHash("sha256")
      .update(rawData)
      .digest("hex");

    console.log(
      "📌 GENERATED HASH:",
      currentHash
    );

    /* ===============================
       CREATE OWNERSHIP RECORD
    =============================== */

    const ownershipRecord =
      await OwnershipHistory.create({

        landId: land._id,

        fromOwner:
          mutation.seller._id,

        fromOwnerName:
          mutation.seller.username,

        toOwner:
          mutation.buyer._id,

        toOwnerName:
          mutation.buyer.username,

        transferType: "sale",

        price: land.price,

        documents: [],

        geoSnapshot: {

          coordinates:
            land.location?.coordinates || [],

          address:
            `${land.city}, ${land.state}`,

          area:
            land.dimensionsString || ""

        },

        previousHash,

        currentHash,

        blockNumber,

        verified: true,

        dateOfTransfer: new Date()

      });

    console.log(
      "✅ OWNERSHIP RECORD CREATED"
    );

    console.log(ownershipRecord);

    /* ===============================
       UPDATE LAND OWNER
    =============================== */

    console.log(
      "📌 OLD OWNER:",
      land.owner
    );

    land.owner =
      mutation.buyer._id;

    land.ownerName =
      mutation.buyer.username;

    land.lastTransferDate =
      new Date();

    /* ===============================
       OWNERSHIP HISTORY
    =============================== */

    land.ownershipCount =
      (land.ownershipCount || 0) + 1;

    land.ownershipHistory.push(
      ownershipRecord._id
    );

    /* ===============================
       FINAL TRANSFER STATE
    =============================== */

    land.transferStatus =
      "transferred";

    land.marketStatus =
      "not_for_sale";

    land.registryStatus =
      "completed";
land.documentsRefreshRequired = true;
    /* ===============================
       SAVE LAND
    =============================== */

    await land.save();

    console.log("✅ LAND UPDATED");

    console.log(
      "📌 NEW OWNER:",
      land.owner
    );

    console.log(
      "📌 MARKET STATUS:",
      land.marketStatus
    );

    /* ===============================
       LOCK MUTATION
    =============================== */

    mutation.isLocked = true;

    mutation.finalizedAt =
      new Date();

    mutation.registryReference =
      `REG-${Date.now()}`;

    await mutation.save();
await addAuditLog({
  landId: land._id,
  action: "Ownership Transfer Completed",
  description:
    `${mutation.seller.username} transferred ownership to ${mutation.buyer.username}`,
  user: req.registrar,
});
    console.log("✅ MUTATION LOCKED");

    console.log(
      "🎉 ===== TRANSFER COMPLETED =====\n"
    );

    return res.json({

      success: true,

      message:
        "Ownership transfer finalized",

      land,

      mutation,

      ownershipRecord

    });

  } catch (err) {

    console.log(
      "\n💥 FINALIZE TRANSFER ERROR"
    );

    console.log(err);

    return res.status(500).json({

      success: false,

      message: err.message

    });

  }

};