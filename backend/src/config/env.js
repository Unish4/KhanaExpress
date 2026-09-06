import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  console.warn(
    `⚠️ Warning: Missing core environment variables: ${missingVars.join(", ")}. Using default local fallbacks.`
  );
}

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/khanaexpress",
  JWT_SECRET: process.env.JWT_SECRET || "khanaexpress_jwt_secret_key_2026",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  ARCJET_KEY: process.env.ARCJET_KEY || "",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
};
