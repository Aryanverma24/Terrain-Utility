import jwt from "jsonwebtoken";
import User from "../modals/UserModal.js"; // adjust path

export const roleAuth = (...roles) => {
  return async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user and attach to req
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
          return res.status(401).json({ message: "Not authorized, user not found" });
        }

        req.user = user;

        // Check role
        if (!roles.includes(req.user.role)) {
          return res.status(403).json({ message: "Access denied!" });
        }

        next();
      } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Not authorized, token failed" });
      }
    } else {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  };
};
