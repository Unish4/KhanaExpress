import express from "express";

import {
  register,
  login,
  getMe,
  changePassword,
  deleteAvatar,
  getUserStats,
  updateProfile,
  uploadAvatar,
} from "../controllers/authController.js";

import { protect, authorize } from "../middleware/auth.js";
// import { loginRateLimit } from "../middleware/arcjet.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);
router.put("/update-profile", protect, updateProfile);
router.delete("/delete-avatar", protect, deleteAvatar);
router.post("/upload-avatar", protect, uploadAvatar);

router.get("/stats", protect, authorize("admin"), getUserStats);

export default router;
