import Land from "../modals/LandModal.js";

export const addAuditLog = async ({
  landId,
  action,
  description = "",
  user = null,
  metadata = {},
  req = null,
}) => {

  try {

    if (!landId || !action) {
      return;
    }

    const land = await Land.findById(landId);

    if (!land) {
      return;
    }

    land.auditTrail.push({

      action,

      description,

      performedBy: user?._id || null,

      performerName:
        user?.username || "System",

      performerRole:
        user?.role || "system",

      metadata,

      ipAddress:
        req?.ip ||
        req?.headers["x-forwarded-for"] ||
        null,

      createdAt: new Date(),

    });

    await land.save();

  } catch (err) {

    console.log(
      "AUDIT LOG ERROR:",
      err.message
    );

  }

};