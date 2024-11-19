

import jwt, { decode } from "jsonwebtoken";
import User from '../modals/UserModal.js';  // Correct path depending on your folder structure


import Land from "../modals/LandModal.js";
import asyncHandler from "../middlerwares/asyncHandler.js";

const createLand = asyncHandler(async (req, res) => {
  console.log("Body data received:", req.body);
  console.log("File data received:", req.file);
  const { landtype, city, state, pincode ,image} = req.body;
  const { userId, userName } = req; // From the authenticated user

  // Check if all required fields are provided
  // if (!landtype || !city || !state || !pincode||!image) {
  //   return res.status(400).send("All fields are required!");
  // }

  try {
    const land = new Land({
      landtype,
      city,
      state,
      pincode,
      image: req.file ? req.file.filename : null, // Save image filename
      owner: userId,      // Owner ID from authenticated user
      ownerName: userName // Owner name from authenticated user
    });
    console.log(land); 
console.log(land);
    // Save to the database
    await land.save();
    console.log(land);
    // Return the created land document as the response
    return res.status(201).json(land);
  } catch (error) {
    console.error("Error during land creation:", error);
    return res.status(500).send("Unable to save in database");
  }
});
const getAllLands = asyncHandler(async (req, res) => {
  const lands = await Land.find({});
  res.status(200).send(lands);
});

const getLandById = asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id);
  if (land) {
    res.status(200).send(land);
  } else {
    res.status(400).send("land not found!");
  }
});

const getLandByUserId = asyncHandler(async (req, res) => {
  try {
    // 1. Extract userId from req.params
    const { id } = req.params;

    // 2. Query the Land model to find all lands where the owner is the provided userId
    const lands = await Land.find({ owner: id }).populate("owner", "username"); // Optional: populate owner data (like username)

    // 3. If no lands are found, return a 404 response
    if (!lands || lands.length === 0) {
      return res.status(404).json({ message: "No lands found for this user." });
    }
    // 4. Return the lands if found
    res.status(200).json(lands);
  } catch (error) {
    // 5. Handle server errors
    console.error(error);
    res.status(500).json({ message: "Error retrieving lands. Please try again later." });
  }
});

const updateLandById = asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id);

  const { landtype, city, pincode, state, owner } = req.body;

  if (land) {
    // Update fields if provided, otherwise keep current values
    land.landtype = landtype || land.landtype;
    land.city = city || land.city;
    land.state = state || land.state;
    land.pincode = pincode || land.pincode;

    if (owner) {
      // Fetch the user if owner update is requested
      const checkOwner = await User.find({ username: owner });
      if (checkOwner && checkOwner.length > 0) {
        const ownerId = checkOwner[0]._id;
        const ownerName = checkOwner[0].username;
        land.owner = ownerId || land.owner;
        land.ownerName = ownerName || land.ownerName;
      } else {
        return res.status(400).send("User not found");
      }
    }

    // Save the updated land to the database
    const updatedLand = await land.save();

    // Return the updated data in the response
    res.status(200).json({
      _id: updatedLand._id,
      landtype: updatedLand.landtype,
      city: updatedLand.city,
      pincode: updatedLand.pincode,
      state: updatedLand.state,
      owner: updatedLand.owner,
      ownerName: updatedLand.ownerName,
    });
  } else {
    res.status(400).send("Land not found!");
  }
});


const deleteLandById = asyncHandler(async (req, res) => {
  const landId = req.params;

  if (landId) {
    await Land.findByIdAndDelete(landId.id);
    res.status(200).send("land successfully removed!");
  } else {
    res.status(400).send("land not found");
  }
});

const getLandbyUser = asyncHandler(async (req, res) => {
  try {
    const username = req.params.username;

    const user = await User.find({ username: username });
    const userId = user[0]._id;
    const owner = await Land.find({ owner: userId });
    res.send(owner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching lands" });
  }
});

//land type

const getLandByType = asyncHandler(async (req, res) => {
  const landtype = req.params;
  console.log(landtype);
  const lands = await Land.find({ landtype: landtype });
  res.json(lands);
});

export {
  createLand,
  getAllLands,
  getLandById,
  getLandByUserId,
  updateLandById,
  deleteLandById,
  getLandbyUser,
  getLandByType,
};
