import { globalLimiter } from "../config/arcjet.js";
import arcjet, { tokenBucket } from "@arcjet/node";
import { ENV } from "../config/env.js";

export const arcjetMiddleware = async (req, res, next) => {
  try {
    // Ask Arcjet if this request is allowed
    const decision = await globalLimiter.protect(req, {
      requested: 1, // Each request uses 1 token
    });

    // If Arcjet DENIES the request
    if (decision.isDenied()) {
      // Check if it's a rate limit
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          success: false,
          error: "Too many requests. Please try again later.",
        });
      }

      // Check if it's a bot
      if (decision.reason.isBot()) {
        return res.status(403).json({
          success: false,
          error: "Bot traffic is not allowed.",
        });
      }

      // Default denial
      return res.status(403).json({
        success: false,
        error: "Access denied.",
      });
    }

    // Request allowed, proceed to next middleware/route
    next();
  } catch (error) {
    console.error("Arcjet error:", error);
    return res.status(503).json({
      success: false,
      error: "Request protection is temporarily unavailable.",
    });
  }
};

const loginLimiter = arcjet({
  key: ENV.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // 5 attempts
      interval: 60, // Per minute
      capacity: 5, // Max 5 attempts
    }),
  ],
});

export const loginRateLimit = async (req, res, next) => {
  try {
    const decision = await loginLimiter.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      return res.status(429).json({
        success: false,
        error: "Too many login attempts. Try again in a minute.",
      });
    }

    return res.status(503).json({
      success: false,
      error: "Request protection is temporarily unavailable.",
    });
  } catch (error) {
    next(); // Allow if Arcjet fails
  }
};
