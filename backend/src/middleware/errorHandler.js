import { ENV } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err.message);

  // Get status code (default 500)
  const statusCode = err.statusCode || 500;
    const message =
    statusCode >= 500 ? "Internal Server Error" : err.message || "Request failed";

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: "Duplicate field value",
    });
  }

  // Handle invalid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(ENV.NODE_ENV === "development" && { stack: err.stack }),
  });
};


export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
};
