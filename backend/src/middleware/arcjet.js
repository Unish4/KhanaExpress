import { globalLimiter } from "../config/arcjet.js";
import arcjet, { tokenBucket } from "@arcjet/node";
import { ENV } from "../config/env.js";

export const arcjetMiddleware = async (req, res, next) => {
  if (!ENV.ARCJET_KEY || ENV.ARCJET_KEY.includes("your_key")) {
    return next();
  }

  try {
    const decision = await globalLimiter.protect(req, {
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          success: false,
          error: "Too many requests. Please try again later.",
        });
      }

      if (decision.reason.isBot()) {
        return res.status(403).json({
          success: false,
          error: "Bot traffic is not allowed.",
        });
      }

      return res.status(403).json({
        success: false,
        error: "Access denied.",
      });
    }

    next();
  } catch (error) {
    console.warn("Arcjet rate limit check skipped:", error.message || error);
    next();
  }
};

const loginLimiter = ENV.ARCJET_KEY && !ENV.ARCJET_KEY.includes("your_key")
  ? arcjet({
      key: ENV.ARCJET_KEY,
      characteristics: ["ip.src"],
      rules: [
        tokenBucket({
          mode: "LIVE",
          refillRate: 5,
          interval: 60,
          capacity: 5,
        }),
      ],
    })
  : null;

export const loginRateLimit = async (req, res, next) => {
  if (!loginLimiter) {
    return next();
  }

  try {
    const decision = await loginLimiter.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      return res.status(429).json({
        success: false,
        error: "Too many login attempts. Try again in a minute.",
      });
    }

    return next();
  } catch (error) {
    next();
  }
};
