import express from "express";
import {
  createMenuItem,
  getMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuItemImage,
  toggleAvailability,
  getRestaurantMenu,
} from "../controllers/menuController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

router.get("/", getMenuItems);

router.get("/restaurant/:restaurantId", getRestaurantMenu);

router.get("/:id", getMenuItem);

router.post("/", protect, authorize("restaurant", "admin"), createMenuItem);

router.put("/:id", protect, authorize("restaurant", "admin"), updateMenuItem);

router.delete(
  "/:id",
  protect,
  authorize("restaurant", "admin"),
  deleteMenuItem,
);

router.post(
  "/:id/image",
  protect,
  authorize("restaurant", "admin"),
  upload.single("image"),
  uploadMenuItemImage,
);

router.patch(
  "/:id/availability",
  protect,
  authorize("restaurant", "admin"),
  toggleAvailability,
);

export default router;
