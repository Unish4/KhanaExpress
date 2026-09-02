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

import upload from "../config/multer.js";
import { protect } from "../middleware/auth.js";
import { loginRateLimit } from "../middleware/arcjet.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", loginRateLimit, login);
router.get("/me", protect, getMe);
router.get("/stats", protect, getUserStats);
router.patch("/me", protect, updateProfile);
router.patch("/change-password", protect, changePassword);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);
router.delete("/avatar", protect, deleteAvatar);

export default router;
