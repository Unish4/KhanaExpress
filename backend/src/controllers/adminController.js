import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import Order from "../models/Order.js";

// @desc    Get overall platform statistics & metrics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getPlatformStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const activeRestaurants = await Restaurant.countDocuments({ isActive: true });

    // Revenue calculation
    const revenueAgg = await Order.aggregate([
      { $match: { status: "delivered" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalDelivered: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const totalDelivered = revenueAgg[0]?.totalDelivered || 0;
    const avgOrderValue = revenueAgg[0]?.avgOrderValue || 0;
    const estimatedCommission = totalRevenue * 0.1; // 10% platform fee

    // User counts by role
    const userRoleAgg = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    const userCounts = {
      customer: 0,
      restaurant: 0,
      delivery: 0,
      admin: 0,
      total: 0,
    };

    userRoleAgg.forEach((item) => {
      if (userCounts.hasOwnProperty(item._id)) {
        userCounts[item._id] = item.count;
      }
      userCounts.total += item.count;
    });

    // Orders by status
    const statusAgg = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const ordersByStatus = {};
    statusAgg.forEach((item) => {
      ordersByStatus[item._id] = item.count;
    });

    // Top 5 restaurants
    const topRestaurants = await Order.aggregate([
      { $match: { status: "delivered" } },
      {
        $group: {
          _id: "$restaurant",
          orderCount: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "restaurants",
          localField: "_id",
          foreignField: "_id",
          as: "restaurantInfo",
        },
      },
      { $unwind: "$restaurantInfo" },
      {
        $project: {
          name: "$restaurantInfo.name",
          cuisine: "$restaurantInfo.cuisine",
          image: "$restaurantInfo.image",
          orderCount: 1,
          revenue: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        estimatedCommission,
        totalDelivered,
        avgOrderValue,
        totalOrders,
        totalRestaurants,
        activeRestaurants,
        userCounts,
        ordersByStatus,
        topRestaurants,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get all system users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.role && req.query.role !== "all") {
      filter.role = req.query.role;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("restaurant", "name");

    const total = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
      },
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update user role or active status
// @route   PATCH /api/admin/users/:id
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const update = {};

    if (role) {
      const validRoles = ["customer", "restaurant", "delivery", "admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: "Invalid role specified",
        });
      }
      update.role = role;
    }

    if (typeof isActive === "boolean") {
      update.isActive = isActive;
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get all restaurants for admin management
// @route   GET /api/admin/restaurants
// @access  Private/Admin
export const getAllAdminRestaurants = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      filter.$or = [{ name: searchRegex }, { cuisine: searchRegex }];
    }

    if (req.query.status === "active") {
      filter.isActive = true;
    } else if (req.query.status === "inactive") {
      filter.isActive = false;
    }

    const restaurants = await Restaurant.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name email phone");

    const total = await Restaurant.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: restaurants.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
      },
      data: restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Toggle restaurant approval/active or featured status
// @route   PATCH /api/admin/restaurants/:id/status
// @access  Private/Admin
export const toggleRestaurantStatus = async (req, res) => {
  try {
    const { isActive, isFeatured } = req.body;
    const update = {};

    if (typeof isActive === "boolean") {
      update.isActive = isActive;
    }
    if (typeof isFeatured === "boolean") {
      update.isFeatured = isFeatured;
    }

    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).populate("owner", "name email");

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Restaurant status updated",
      data: restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get all system orders audit log
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllSystemOrders = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customer", "name phone email")
      .populate("restaurant", "name address phone")
      .populate("deliveryPartner", "name phone");

    const total = await Order.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
      },
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
