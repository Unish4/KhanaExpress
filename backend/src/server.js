import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { connectDB } from "./config/db.js";

// Import all routes
import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";

// Import middleware
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { arcjetMiddleware } from "./middleware/arcjet.js";
import { ENV } from "./config/env.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: ENV.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Morgan logs all HTTP requests
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Parse JSON request bodies
// limit: 10kb prevents overly large requests
app.use(express.json({ limit: "10kb" }));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/api", arcjetMiddleware);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🍔 Food Delivery API",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/me",
        updateProfile: "PATCH /api/auth/me",
        changePassword: "PATCH /api/auth/change-password",
        uploadAvatar: "POST /api/auth/avatar",
        deleteAvatar: "DELETE /api/auth/avatar",
        stats: "GET /api/auth/stats",
      },
      restaurants: {
        getAll: "GET /api/restaurants",
        getOne: "GET /api/restaurants/:id",
        create: "POST /api/restaurants",
        update: "PUT /api/restaurants/:id",
        delete: "DELETE /api/restaurants/:id",
        uploadImage: "POST /api/restaurants/:id/image",
        toggleOpen: "PATCH /api/restaurants/:id/toggle-open",
        stats: "GET /api/restaurants/:id/stats",
      },
      menu: {
        getAll: "GET /api/menu",
        getOne: "GET /api/menu/:id",
        create: "POST /api/menu",
        update: "PUT /api/menu/:id",
        delete: "DELETE /api/menu/:id",
        uploadImage: "POST /api/menu/:id/image",
        toggleAvailability: "PATCH /api/menu/:id/availability",
        restaurantMenu: "GET /api/menu/restaurant/:restaurantId",
      },
      orders: {
        create: "POST /api/orders",
        myOrders: "GET /api/orders",
        restaurantOrders: "GET /api/orders/restaurant",
        deliveryOrders: "GET /api/orders/delivery",
        availableOrders: "GET /api/orders/available",
        getOne: "GET /api/orders/:id",
        accept: "PATCH /api/orders/:id/accept",
        updateStatus: "PATCH /api/orders/:id/status",
        cancel: "PATCH /api/orders/:id/cancel",
        pickup: "PATCH /api/orders/:id/pickup",
        deliver: "PATCH /api/orders/:id/deliver",
        stats: "GET /api/orders/stats/summary",
      },
      reviews: {
        create: "POST /api/reviews",
        restaurantReviews: "GET /api/reviews/restaurant/:restaurantId",
        menuReviews: "GET /api/reviews/menu/:menuItemId",
        update: "PUT /api/reviews/:id",
        delete: "DELETE /api/reviews/:id",
      },
      addresses: {
        getAll: "GET /api/addresses",
        create: "POST /api/addresses",
        getOne: "GET /api/addresses/:id",
        update: "PUT /api/addresses/:id",
        delete: "DELETE /api/addresses/:id",
        setDefault: "PATCH /api/addresses/:id/default",
        getDefault: "GET /api/addresses/default",
      },
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Route files
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/addresses", addressRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = ENV.PORT;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server: http://localhost:${PORT}`);
      console.log(`Environment: ${ENV.NODE_ENV}`);
      console.log(`Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
