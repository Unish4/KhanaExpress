import MenuItem from "../models/MenuItem.js";
import Restaurant from "../models/Restaurant.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinaryUpload.js";

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createMenuItem = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        success: false,
        error: "Only restaurant owners can add menu items",
      });
    }

    if (!req.user.restaurant) {
      return res.status(400).json({
        success: false,
        error: "You must create a restaurant first",
      });
    }

    const {
      name,
      description,
      category,
      price,
      isVegetarian,
      isVegan,
      spicyLevel,
      ingredients,
      preparationTime,
    } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, category, and price",
      });
    }

    const existingItem = await MenuItem.findOne({
      restaurant: req.user.restaurant,
      name: name,
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        error: "You already have a menu item with this name",
      });
    }

    const menuItem = await MenuItem.create({
      restaurant: req.user.restaurant,
      name,
      description: description || "",
      category,
      price,
      isVegetarian: isVegetarian || false,
      isVegan: isVegan || false,
      spicyLevel: spicyLevel || 0,
      ingredients: ingredients || [],
      preparationTime: preparationTime || 15,
    });

    return res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: menuItem,
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

export const getMenuItems = async (req, res) => {
  try {
    const filter = {};

    if (typeof req.query.restaurant === "string") {
      filter.restaurant = req.query.restaurant;
    }

    if (typeof req.query.category === "string") {
      filter.category = req.query.category;
    }

    if (req.query.isVegetarian !== undefined) {
      filter.isVegetarian = req.query.isVegetarian === "true";
    }

    if (req.query.isVegan !== undefined) {
      filter.isVegan = req.query.isVegan === "true";
    }

    if (req.query.available !== undefined) {
    if (req.query.price && typeof req.query.price === "object") {
      const priceFilter = {};
      const gte = parseFloat(req.query.price.gte);
      const lte = parseFloat(req.query.price.lte);
      if (!Number.isNaN(gte)) priceFilter.$gte = gte;
      if (!Number.isNaN(lte)) priceFilter.$lte = lte;
      if (Object.keys(priceFilter).length > 0) filter.price = priceFilter;
    }        priceFilter.$lte = parseFloat(req.query.price.lte);
      filter.price = priceFilter;
    }

    if (req.query.search) {
      const searchRegex = {
        $regex: escapeRegex(req.query.search),
        $options: "i",
      };
      filter.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    let sort = { createdAt: -1 };

    if (req.query.sort) {
      const sortField = req.query.sort.replace("-", "");
      const sortOrder = req.query.sort.startsWith("-") ? -1 : 1;
      sort = { [sortField]: sortOrder };
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const menuItems = await MenuItem.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("restaurant", "name cuisine");

    const total = await MenuItem.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: menuItems.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
      data: menuItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate(
      "restaurant",
      "name cuisine image address",
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid menu item ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      });
    }

    const isOwner =
      menuItem.restaurant.toString() === req.user.restaurant?.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own menu items",
      });
    }

    const { restaurant, rating, totalReviews, ...updateData } = req.body;

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: updatedItem,
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
        error: "Invalid menu item ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      });
    }

    const isOwner =
      menuItem.restaurant.toString() === req.user.restaurant?.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own menu items",
      });
    }

    if (menuItem.image?.publicId) {
      try {
        await deleteFromCloudinary(menuItem.image.publicId);
      } catch (err) {
        console.error("Failed to delete image:", err);
      }
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
      data: {},
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid menu item ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const uploadMenuItemImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload an image file",
      });
    }

    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      });
    }

    const isOwner =
      menuItem.restaurant.toString() === req.user.restaurant?.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own menu items",
      });
    }

    const oldImagePublicId = menuItem.image?.publicId;
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      "food-delivery/menu-items",
    );

    menuItem.image = {
      url: result.url,
      publicId: result.publicId,
    };
    await menuItem.save();

    if (oldImagePublicId) {
      try {
        await deleteFromCloudinary(oldImagePublicId);
      } catch (err) {
        console.error("Failed to delete old image:", err);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Menu item image uploaded successfully",
      data: { image: menuItem.image },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid menu item ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const toggleAvailability = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      });
    }

    const isOwner =
      menuItem.restaurant.toString() === req.user.restaurant?.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own menu items",
      });
    }

    menuItem.available = !menuItem.available;
    await menuItem.save();

    return res.status(200).json({
      success: true,
      message: menuItem.available
        ? "Menu item is now AVAILABLE"
        : "Menu item is now UNAVAILABLE",
      data: { available: menuItem.available },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid menu item ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getRestaurantMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const filter = {};

    if (typeof restaurantId === "string") {
      filter.restaurant = restaurantId;
    }

    if (typeof req.query.category === "string") {
      filter.category = req.query.category;
    }

    if (req.query.available !== undefined) {
      filter.available = req.query.available === "true";
    }

    if (req.query.isVegetarian !== undefined) {
      filter.isVegetarian = req.query.isVegetarian === "true";
    }

    const menuItems = await MenuItem.find(filter).sort({
      category: 1,
      name: 1,
    });

    return res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems,
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
