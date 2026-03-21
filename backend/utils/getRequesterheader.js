import jwt from "jsonwebtoken";

export const getRequesterFromHeader = (req) => {
  try {
    const authHeader = req.headers.authorization;

    

    if (!authHeader) return null;

    let token;

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }

    // ✅ CLEAN TOKEN (VERY IMPORTANT)
    token = token?.trim();

  

    if (!token || token === "undefined") return null;

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