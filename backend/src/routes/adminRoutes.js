import express from "express";
import {
  getPlatformStats,
  getAllUsers,
  updateUserStatus,
  getAllAdminRestaurants,
  toggleRestaurantStatus,
  getAllSystemOrders,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Apply protect & admin role authorization to all admin endpoints
router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getPlatformStats);

router.get("/users", getAllUsers);
router.patch("/users/:id", updateUserStatus);

router.get("/restaurants", getAllAdminRestaurants);
router.patch("/restaurants/:id/status", toggleRestaurantStatus);

router.get("/orders", getAllSystemOrders);

export default router;
