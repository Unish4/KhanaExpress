import express from "express";
import {
  createRestaurant,
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
  uploadRestaurantImage,
  toggleOpen,
  getRestaurantStats,
} from "../controllers/restaurantController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

router.get("/", getRestaurants);

router.get("/:id", getRestaurant);

router.post("/", protect, authorize("restaurant", "admin"), createRestaurant);

router.put("/:id", protect, authorize("restaurant", "admin"), updateRestaurant);

router.delete(
  "/:id",
  protect,
  authorize("restaurant", "admin"),
  deleteRestaurant,
);

router.post(
  "/:id/image",
  protect,
  authorize("restaurant", "admin"),
  upload.single("image"),
  uploadRestaurantImage,
);

router.patch(
  "/:id/toggle-open",
  protect,
  authorize("restaurant", "admin"),
  toggleOpen,
);

router.get(
  "/:id/stats",
  protect,
  authorize("restaurant", "admin"),
  getRestaurantStats,
);

export default router;
