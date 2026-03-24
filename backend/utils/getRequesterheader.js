import jwt from "jsonwebtoken";

export const getRequesterFromHeader = (req) => {
  try {
    const authHeader = req.headers.authorization;

<<<<<<< HEAD
    console.log("🔥 RAW AUTH HEADER:", authHeader);
=======
    
>>>>>>> a1564f3440c9dbaf7e44fe1de0295cff4e5508b5

    if (!authHeader) return null;

    let token;

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }

    // ✅ CLEAN TOKEN (VERY IMPORTANT)
    token = token?.trim();

<<<<<<< HEAD
    console.log("🔥 CLEAN TOKEN:", token);
=======
  
>>>>>>> a1564f3440c9dbaf7e44fe1de0295cff4e5508b5

    if (!token || token === "undefined") return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

<<<<<<< HEAD
    console.log("✅ DECODED:", decoded);
=======
  
>>>>>>> a1564f3440c9dbaf7e44fe1de0295cff4e5508b5

    return {
      id: (decoded.userId || decoded.id || decoded._id || "").toString(),
      role: decoded.role || null,
    };

  } catch (err) {
    console.error("⚠️ JWT verification failed:", err.message);
    return null;
  }
};