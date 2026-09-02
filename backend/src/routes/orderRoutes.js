import express from "express";
import {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  getDeliveryOrders,
  getAvailableOrders,
  getOrder,
  acceptOrder,
  updateOrderStatus,
  cancelOrder,
  pickupOrder,
  deliverOrder,
  getOrderStats,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/stats/summary", authorize("admin"), getOrderStats);

router.get("/restaurant", authorize("restaurant"), getRestaurantOrders);

router.get("/delivery", authorize("delivery"), getDeliveryOrders);

router.get("/available", authorize("delivery"), getAvailableOrders);

router
  .route("/")
  .get(authorize("customer"), getMyOrders)
  .post(authorize("customer"), createOrder);

router.get("/:id", getOrder);

router.patch("/:id/accept", authorize("restaurant"), acceptOrder);

router.patch("/:id/status", updateOrderStatus);

router.patch("/:id/cancel", authorize("customer", "admin"), cancelOrder);

router.patch("/:id/pickup", authorize("delivery"), pickupOrder);

router.patch("/:id/deliver", authorize("delivery"), deliverOrder);

export default router;
