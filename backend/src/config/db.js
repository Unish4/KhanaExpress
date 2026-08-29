import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI);
    console.log("Mongodb connected successfully", conn.connection.host);
  } catch (error) {
    console.error("Mongodb connection failed", error);
    process.exit(1);
  }
};
