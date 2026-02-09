import jwt from "jsonwebtoken";



export const getRequesterFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return {
      id: (decoded.userId || decoded.id || decoded._id || "").toString(),
      role: decoded.role || null,
    };
  } catch (err) {
    console.error("⚠️ JWT verification failed:", err.message);
    return null;
  }
};
