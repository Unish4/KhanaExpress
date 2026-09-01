import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { ENV } from "./env.js";

export const globalLimiter = arcjet({
  key: ENV.ARCJET_KEY,
  characteristics: ["ip.src"], // Track by IP address

  rules: [
    shield({ mode: "LIVE" }),

    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"], // Allow Google, Bing, etc.
    }),

    tokenBucket({
      mode: "LIVE",
      refillRate: 100, // 100 tokens per interval
      interval: 60, // 60 seconds (1 minute)
      capacity: 100, // Maximum 100 requests
    }),
  ],
});


