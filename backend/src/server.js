import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "KhanaExpress API",
    version: "1.0.0",
    status: "Server is running!",
  });
});

const PORT = ENV.PORT;

const startServer = async () => {
  try {
    connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${ENV.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
