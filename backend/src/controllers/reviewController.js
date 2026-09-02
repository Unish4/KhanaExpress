import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";

export const createReview = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        error: "Only customers can write reviews",
      });
    }

    const {
      order: orderId,
      rating,
      comment,
      restaurant: restaurantId,
      menuItem: menuItemId,
    } = req.body;

    if (!orderId || !rating) {
      return res.status(400).json({
        success: false,
        error: "Please provide order ID and rating",
      });
    }

    if (!restaurantId && !menuItemId) {
      return res.status(400).json({
        success: false,
        error: "Please provide restaurant or menu item to review",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    if (order.customer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You can only review your own orders",
      });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        success: false,
        error: "You can only review delivered orders",
      });
    }

    if (
      restaurantId &&
      order.restaurant.toString() !== restaurantId.toString()
    ) {
      return res.status(400).json({
        success: false,
        error: "This order is not from the specified restaurant",
      });
    }

    if (menuItemId) {
      const itemInOrder = order.items.some(
        (item) => item.menuItem.toString() === menuItemId.toString(),
      );

      if (!itemInOrder) {
        return res.status(400).json({
          success: false,
          error: "This menu item is not in your order",
        });
      }
    }

    const existingReview = await Review.findOne({
      user: req.user.id,
      order: orderId,
      ...(menuItemId ? { menuItem: menuItemId } : { restaurant: restaurantId }),
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error:
          "You have already reviewed this. Update your existing review instead.",
      });
    }

    const review = await Review.create({
      user: req.user.id,
      order: orderId,
      restaurant: restaurantId || null,
      menuItem: menuItemId || null,
      rating,
      comment: comment || "",
      isVerified: true,
    });

    if (restaurantId) {
      await updateRestaurantRating(restaurantId);
    }

    if (menuItemId) {
      await updateMenuItemRating(menuItemId);
    }

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
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
        error: "Invalid ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const filter = { restaurant: restaurantId };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name avatar");

    const total = await Review.countDocuments(filter);

    const distribution = await Review.aggregate([
      { $match: { restaurant: mongoose.Types.ObjectId(restaurantId) } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
      ratingDistribution: distribution,
      data: reviews,
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

export const getMenuItemReviews = async (req, res) => {
  try {
    const { menuItemId } = req.params;

    const filter = { menuItem: menuItemId };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name avatar");

    const total = await Review.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
      data: reviews,
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

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    if (review.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own reviews",
      });
    }

    const { rating, comment } = req.body;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5",
      });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    if (review.restaurant) {
      await updateRestaurantRating(review.restaurant);
    }

    if (review.menuItem) {
      await updateMenuItemRating(review.menuItem);
    }

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid review ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    const isAuthor = review.user.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own reviews",
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    if (review.restaurant) {
      await updateRestaurantRating(review.restaurant);
    }

    if (review.menuItem) {
      await updateMenuItemRating(review.menuItem);
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid review ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

async function updateRestaurantRating(restaurantId) {
  try {
    const result = await Review.aggregate([
      { $match: { restaurant: restaurantId } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: Math.round(result[0].avgRating * 10) / 10,
        totalReviews: result[0].totalReviews,
      });
    } else {
      await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: 0,
        totalReviews: 0,
      });
    }
  } catch (error) {
    console.error("Error updating restaurant rating:", error);
  }
}

async function updateMenuItemRating(menuItemId) {
  try {
    const result = await Review.aggregate([
      { $match: { menuItem: menuItemId } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      await MenuItem.findByIdAndUpdate(menuItemId, {
        rating: Math.round(result[0].avgRating * 10) / 10,
        totalReviews: result[0].totalReviews,
      });
    } else {
      await MenuItem.findByIdAndUpdate(menuItemId, {
        rating: 0,
        totalReviews: 0,
      });
    }
  } catch (error) {
    console.error("Error updating menu item rating:", error);
  }
}
