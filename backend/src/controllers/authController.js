import User from "../models/User.js";
import Order from "../models/Order.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import { successResponse, errorResponse } from "../utils/response.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinaryUpload.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role = "customer", phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, email, and password",
      });
    }

    const validRoles = ["customer", "restaurant", "delivery"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Valid roles: ${validRoles.join(", ")}`,
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || "",
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A user with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Account deactivated!!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { password, role, email, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Please provide current and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload an image file",
      });
    }

    const user = await User.findById(req.user.id);

    if (user.avatar?.publicId) {
      try {
        await deleteFromCloudinary(user.avatar.publicId);
        console.log(`Deleted old avatar: ${user.avatar.publicId}`);
      } catch (error) {
        console.error("Failed to delete old avatar:", error);
      }
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      "KhanaExpress/avatars",
    );

    user.avatar = {
      url: result.url,
      publicId: result.publicId,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: { avatar: user.avatar },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!user.avatar?.publicId) {
      return res.status(400).json({
        success: false,
        message: "No avatar to delete",
      });
    }
    
    await deleteFromCloudinary(user.avatar.publicId);

    user.avatar = {
      url: "",
      publicId: "",
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Avatar removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const stats = {
      name: user.name,
      role: user.role,
      favoriteRestaurants: user.favoriteRestaurants.length,
      favoriteDishes: user.favoriteDishes.length,
    };

    if (user.role === "customer") {
      const totalOrders = await Order.countDocuments({ customer: user._id });
      const completedOrders = await Order.countDocuments({
        customer: user._id,
        status: "delivered",
      });

      const pendingOrders = await Order.countDocuments({
        customer: user._id,
        status: {
          $in: ["pending", "confirmed", "preparing", "ready", "delivering"],
        },
      });

      stats.totalOrders = totalOrders;
      stats.completedOrders = completedOrders;
      stats.pendingOrders = pendingOrders;
    } else if (user.role === "restaurant") {
      // RESTAURANT: Count orders for their restaurant
      if (user.restaurant) {
        const totalOrders = await Order.countDocuments({
          restaurant: user.restaurant,
        });
        const pendingOrders = await Order.countDocuments({
          restaurant: user.restaurant,
          status: "pending",
        });
        const activeOrders = await Order.countDocuments({
          restaurant: user.restaurant,
          status: { $in: ["confirmed", "preparing", "ready"] },
        });

        stats.totalOrders = totalOrders;
        stats.pendingOrders = pendingOrders;
        stats.activeOrders = activeOrders;
      }
    } else if (user.role === "delivery") {
      // DELIVERY: Count their deliveries
      const totalDeliveries = await Order.countDocuments({
        deliveryPartner: user._id,
        status: "delivered",
      });
      const activeDeliveries = await Order.countDocuments({
        deliveryPartner: user._id,
        status: { $in: ["ready", "delivering"] },
      });

      stats.totalDeliveries = totalDeliveries;
      stats.activeDeliveries = activeDeliveries;
    }

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
