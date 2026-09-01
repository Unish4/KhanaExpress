import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const generateToken = (userId) => {
  const payload = {
    id: userId,
  };

  const secret = ENV.JWT_SECRET;

  const options = {
    expiresIn: "30d",
  };

  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    return {
      success: true,
      data: decoded,
    };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return {
        success: false,
        error: "Token has expired. Please login again.",
      };
    }

    if (error.name === "JsonWebTokenError") {
      return {
        success: false,
        error: "Invalid token. Please provide a valid token.",
      };
    }

    return {
      success: false,
      error: "Token verification failed.",
    };
  }
};
