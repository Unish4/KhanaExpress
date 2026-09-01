import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.includes("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Please login to access this resource",
      });
    }

    const result = verifyToken(token);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error,
      });
    }

    const user = await User.findById(result.data.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User no longer exists",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Account deactivated. Contact support.",
      });
    }

    req.user = user;

    return next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Authentication failed due to server error",
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is set by protect middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized to access this resource. Required: ${roles.join(", ")}`,
      });
    }

    next();
  };
};
