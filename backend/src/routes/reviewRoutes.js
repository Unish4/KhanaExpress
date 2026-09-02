import express from "express";
import {
  createReview,
  getRestaurantReviews,
  getMenuItemReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/restaurant/:restaurantId", getRestaurantReviews);

router.get("/menu/:menuItemId", getMenuItemReviews);

router.post("/", protect, authorize("customer"), createReview);

router.put("/:id", protect, authorize("customer"), updateReview);

router.delete("/:id", protect, deleteReview);

export default router;
