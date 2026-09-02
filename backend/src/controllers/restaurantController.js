import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinaryUpload.js";

export const createRestaurant = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        success: false,
        error: "Only users with restaurant role can create restaurants",
      });
    }

    if (req.user.restaurant) {
      return res.status(400).json({
        success: false,
        error: "You already have a restaurant. Update it instead.",
      });
    }

    const {
      name,
      description,
      cuisine,
      address,
      phone,
      hours,
      deliveryTime,
      minimumOrder,
      deliveryFee,
    } = req.body;

    if (!name || !cuisine || !address?.street || !address?.city) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, cuisine, and address (street & city)",
      });
    }

    const existingRestaurant = await Restaurant.findOne({ name });

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        error: "A restaurant with this name already exists",
      });
    }

    const restaurant = await Restaurant.create({
      name,
      description,
      cuisine,
      address,
      phone: phone || "",
      hours,
      deliveryTime,
      minimumOrder,
      deliveryFee,
      owner: req.user.id,
    });

    await User.findByIdAndUpdate(
      req.user.id,
      {
        restaurant: restaurant._id,
      },
      {
        new: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Restaurant created successfully",
      data: restaurant,
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
        error: "A restaurant with this name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getRestaurants = async (req, res) => {
  try {
    const filter = {};

    if (req.query.cuisine) {
      filter.cuisine = req.query.cuisine.toLowerCase();
    }

    if (req.query.isOpen !== undefined) {
      filter.isOpen = req.query.isOpen === "true";
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.rating) {
      const ratingFilter = {};

      if (req.query.rating.gte)
        ratingFilter.$gte = parseFloat(req.query.rating.gte);
      if (req.query.rating.lte)
        ratingFilter.$lte = parseFloat(req.query.rating.lte);
      filter.rating = ratingFilter;
    }

    if (req.query.search) {
      const searchRegex = {
        $regex: req.query.search,
        $options: "i",
      };
      filter.$or = [
        {
          name: searchRegex,
        },
        {
          description: searchRegex,
        },
      ];
    }

    let sort = { createdAt: -1 };

    if (req.query.sort) {
      const sortField = req.query.sort.replace("-", ""); // Remove minus
      const sortOrder = req.query.sort.startsWith("-") ? -1 : 1;
      sort = { [sortField]: sortOrder };
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = Number(page - 1) * limit;

    const restaurants = await Restaurant.find(filter)
      .sort(sort)
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
        limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
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

export const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "restaurant",
      "name email phone",
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const menu = await MenuItem.find({
      restaurant: restaurant._id,
      available: true,
    }).select(
      "name description category price image isVegetarian isVegan spicyLevel",
    );

    return res.status(200).json({
      success: true,
      data: {
        ...restaurant.toObject(),
        menu,
        menuCount: menu.length,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid restaurant ID format",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "A restaurant with this name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const isOwner = restaurant.owner.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own restaurant",
      });
    }

    const { owner, rating, totalReviews, ...updateData } = req.body;

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid restaurant ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const isOwner = restaurant.owner.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own restaurant",
      });
    }

    if (restaurant.image?.publicId) {
      try {
        await deleteFromCloudinary(restaurant.image.publicId);
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }

    await MenuItem.deleteMany({ restaurant: restaurant._id });

    await Restaurant.findByIdAndDelete(req.params.id);

    await User.findByIdAndUpdate(restaurant.owner, {
      restaurant: null,
    });
    return res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
      data: {},
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid restaurant ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const uploadRestaurantImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload an image file",
      });
    }

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const isOwner = restaurant.owner.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own restaurant",
      });
    }

    const oldImagePublicId = restaurant.image?.publicId;
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      "KhanaExpress/restaurants",
    );

    restaurant.image = {
      url: result.url,
      publicId: result.publicId,
    };
    try {
      await restaurant.save();
    } catch (saveError) {
      try {
        await deleteFromCloudinary(result.publicId);
      } catch (deleteError) {
        console.error("Failed to delete new image after save error:", deleteError);
      }

      throw saveError;
    }

    if (oldImagePublicId) {
      try {
        await deleteFromCloudinary(oldImagePublicId);
      } catch (error) {
        console.error("Failed to delete old image:", error);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Restaurant image uploaded successfully",
      data: { image: restaurant.image },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid restaurant ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const toggleOpen = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const isOwner = restaurant.owner.toString() === req.user.id.toString();
    const isAdmin = req.user.role;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own restaurant",
      });
    }

    restaurant.isOpen = !restaurant.isOpen;
    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: restaurant.isOpen
        ? "Restaurant is now OPEN"
        : "Restaurant is now CLOSED",
      data: { isOpen: restaurant.isOpen },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid restaurant ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getRestaurantStats = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const isOwner = restaurant.owner.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You can only view your own restaurant stats",
      });
    }

    const totalOrders = await Order.countDocuments({
      restaurant: restaurant._id,
    });

    const completedOrders = await Order.countDocuments({
      restaurant: restaurant._id,
      status: "delivered",
    });

    const cancelledOrders = await Order.countDocuments({
      restaurant: restaurant._id,
      status: "cancelled",
    });

    const menuCount = await MenuItem.countDocuments({
      restaurant: restaurant._id,
    });
    const availableItems = await MenuItem.countDocuments({
      restaurant: restaurant._id,
      available: true,
    });

    const revenueData = await Order.aggregate([
      {
        $match: {
          restaurant: restaurant._id,
          status: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          avgOrderValue: { $avg: "$total" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
        },
        menu: {
          totalItems: menuCount,
          availableItems,
        },
        revenue: {
          total: revenueData[0]?.totalRevenue || 0,
          averagePerOrder: revenueData[0]?.avgOrderValue || 0,
        },
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid restaurant ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
