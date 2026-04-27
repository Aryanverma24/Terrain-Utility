import jwt from 'jsonwebtoken';
import User from '../modals/UserModal.js';
import asyncHandler from '../middlerwares/asyncHandler.js';
import Registrar from '../modals/registrarModal.js';


const authenticateRegistrar = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "registrar") {
      return res.status(401).json({ message: "Not a registrar" });
    }

    const registrar = await Registrar.findById(decoded.userId);

    if (!registrar) {
      return res.status(401).json({ message: "Registrar not found" });
    }

    req.registrar = registrar;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Registrar auth failed" });
  }
});

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId || decoded.id;

    req.role = decoded.role;
    req.userId = userId;

    // Only buyer/seller + lawyer users
    if (
      ["buyerSeller", "user", "lawyer"].includes(decoded.role)
    ) {
      const user = await User.findById(userId).select("-password");

      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      req.user = user;
      return next();
    }

    return res.status(401).json({
      message: "Unauthorized role",
    });

  } catch (err) {
    console.log("AUTH ERROR:", err.message);

    return res.status(401).json({
      message: "Token invalid",
    });
  }
});

const authorizeAdmin = asyncHandler(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).send("No token");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const userId = decoded.userId || decoded.id;

  const user = await User.findById(userId).select("-password");

  if (user?.isAdmin) {
    next();
  } else {
    res.status(401).send("Unauthorized Admin");
  }
});

export { authenticate, authorizeAdmin ,authenticateRegistrar};
