import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";
import User from "../models/User.js";

export const createOrder = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        error: "Only customers can place orders",
      });
    }

    const {
      restaurant: restaurantId,
      items,
      deliveryAddress,
      paymentMethod = "cash",
    } = req.body;

    if (!restaurantId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide restaurant, items, and delivery address",
      });
    }

    if (!deliveryAddress?.street || !deliveryAddress?.city) {
      return res.status(400).json({
        success: false,
        error: "Please provide delivery address with street and city",
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    if (!restaurant.isOpen || restaurant.status !== "active") {
      return res.status(400).json({
        success: false,
        error: "Restaurant is currently closed",
      });
    }

    const orderItems = [];
    let subtotal = 0;

    for (let i = 0; i < items.length; i++) {
      const {
        menuItem: menuItemId,
        quantity = 1,
        specialInstructions = "",
      } = items[i];

      if (quantity < 1 || quantity > 20) {
        return res.status(400).json({
          success: false,
          error: "Quantity must be between 1 and 20",
        });
      }

      const menuItem = await MenuItem.findById(menuItemId);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          error: `Menu item with ID ${menuItemId} not found`,
        });
      }

      if (menuItem.restaurant.toString() !== restaurantId.toString()) {
        return res.status(400).json({
          success: false,
          error: `Menu item "${menuItem.name}" does not belong to this restaurant`,
        });
      }

      if (!menuItem.available) {
        return res.status(400).json({
          success: false,
          error: `Menu item "${menuItem.name}" is currently unavailable`,
        });
      }

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        specialInstructions,
      });

      subtotal += menuItem.price * quantity;
    }

    if (subtotal < restaurant.minimumOrder) {
      return res.status(400).json({
        success: false,
        error: `Minimum order is $${restaurant.minimumOrder}. Your subtotal is $${subtotal}`,
      });
    }

    const deliveryFee = restaurant.deliveryFee || 0;
    const tax = subtotal * 0.08;
    const total = subtotal + tax + deliveryFee;

    const estimatedDelivery = new Date(
      Date.now() + restaurant.deliveryTime * 60 * 1000,
    );

    const order = await Order.create({
      customer: req.user.id,
      restaurant: restaurantId,
      items: orderItems,
      subtotal,
      deliveryFee,
      tax,
      total,
      deliveryAddress,
      paymentMethod,
      estimatedDelivery,
      orderDate: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
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

export const getMyOrders = async (req, res) => {
  try {
    const filter = { customer: req.user.id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const sort = { createdAt: -1 };
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("restaurant", "name image cuisine");

    const total = await Order.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
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

export const getRestaurantOrders = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        success: false,
        error: "Only restaurant owners can view restaurant orders",
      });
    }

    if (!req.user.restaurant) {
      return res.status(400).json({
        success: false,
        error: "You must create a restaurant first",
      });
    }

    const filter = { restaurant: req.user.restaurant };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const sort = { createdAt: -1 };
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("customer", "name phone");

    const total = await Order.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
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

export const getDeliveryOrders = async (req, res) => {
  try {
    if (req.user.role !== "delivery") {
      return res.status(403).json({
        success: false,
        error: "Only delivery partners can view delivery orders",
      });
    }

    const filter = { deliveryPartner: req.user.id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("restaurant", "name address phone")
      .populate("customer", "name phone");

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getAvailableOrders = async (req, res) => {
  try {
    if (req.user.role !== "delivery") {
      return res.status(403).json({
        success: false,
        error: "Only delivery partners can view available orders",
      });
    }

    const orders = await Order.find({
      status: "ready",
      deliveryPartner: null,
    })
      .sort({ createdAt: 1 })
      .populate("restaurant", "name address");

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name phone email")
      .populate("restaurant", "name address phone image")
      .populate("deliveryPartner", "name phone")
      .populate("items.menuItem", "image category");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    const isCustomer = order.customer._id.toString() === req.user.id.toString();

    const isRestaurantOwner =
      order.restaurant._id.toString() === req.user.restaurant?.toString();

    const isDeliveryPartner =
      order.deliveryPartner?.toString() === req.user.id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isCustomer && !isRestaurantOwner && !isDeliveryPartner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        success: false,
        error: "Only restaurant owners can accept orders",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    if (order.restaurant.toString() !== req.user.restaurant?.toString()) {
      return res.status(403).json({
        success: false,
        error: "This order belongs to another restaurant",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: `Cannot accept order with status '${order.status}'`,
      });
    }

    order.status = "confirmed";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order accepted",
      data: { status: order.status },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "delivering",
      "delivered",
      "cancelled",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Valid: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    const isCustomer = order.customer.toString() === req.user.id.toString();

    const isRestaurantOwner =
      order.restaurant.toString() === req.user.restaurant?.toString();

    const isDeliveryPartner =
      order.deliveryPartner?.toString() === req.user.id.toString();

    const isAdmin = req.user.role === "admin";

    if (req.user.role === "restaurant" && !isRestaurantOwner) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own restaurant orders",
      });
    }

    if (req.user.role === "delivery" && !isDeliveryPartner) {
      return res.status(403).json({
        success: false,
        error: "You can only update your assigned orders",
      });
    }

    order.status = status;

    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    if (status === "cancelled") {
      order.cancelledAt = new Date();
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'`,
      data: { status: order.status },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    const isCustomer = order.customer.toString() === req.user.id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isCustomer && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You can only cancel your own orders",
      });
    }

    const cancellableStatuses = ["pending", "confirmed"];

    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel order with status '${order.status}'. Food is already being prepared.`,
      });
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = cancelReason || "Cancelled by customer";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: { status: order.status },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const pickupOrder = async (req, res) => {
  try {
    if (req.user.role !== "delivery") {
      return res.status(403).json({
        success: false,
        error: "Only delivery partners can pick up orders",
      });
    }

    if (!req.user.isAvailable) {
      return res.status(400).json({
        success: false,
        error:
          "You are not available for deliveries. Update your availability first.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    if (order.status !== "ready") {
      return res.status(400).json({
        success: false,
        error: `Cannot pick up order with status '${order.status}'`,
      });
    }

    if (order.deliveryPartner) {
      return res.status(400).json({
        success: false,
        error: "Order already assigned to another delivery partner",
      });
    }

    order.deliveryPartner = req.user.id;
    order.status = "delivering";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order picked up",
      data: {
        status: order.status,
        deliveryPartner: order.deliveryPartner,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deliverOrder = async (req, res) => {
  try {
    if (req.user.role !== "delivery") {
      return res.status(403).json({
        success: false,
        error: "Only delivery partners can deliver orders",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    if (order.deliveryPartner?.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You are not assigned to this order",
      });
    }

    if (order.status !== "delivering") {
      return res.status(400).json({
        success: false,
        error: `Cannot deliver order with status '${order.status}'`,
      });
    }

    order.status = "delivered";
    order.deliveredAt = new Date();
    order.paymentStatus = "paid";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order delivered successfully",
      data: {
        status: order.status,
        deliveredAt: order.deliveredAt,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only admins can view order statistics",
      });
    }

    const totalOrders = await Order.countDocuments();

    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const revenueData = await Order.aggregate([
      {
        $match: { status: "delivered" },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          avgOrderValue: { $avg: "$total" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const topRestaurants = await Order.aggregate([
      { $match: { status: "delivered" } },
      {
        $group: {
          _id: "$restaurant",
          orderCount: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { orderCount: -1 } },
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
          orderCount: 1,
          revenue: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        ordersByStatus,
        revenue: {
          total: revenueData[0]?.totalRevenue || 0,
          averageOrderValue: revenueData[0]?.avgOrderValue || 0,
        },
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
