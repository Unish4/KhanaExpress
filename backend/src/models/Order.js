import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a customer"],
      index: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Order must belong to a restaurant"],
      index: true,
    },

    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    items: {
      type: [
        {
          menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MenuItem",
            required: [true, "Order item must reference a menu item"],
          },
          name: {
            type: String,
            required: [true, "Order item must have a name"],
          },

          price: {
            type: Number,
            required: [true, "Order item must have a price"],
            min: [0, "Price cannot be negative"],
          },

          quantity: {
            type: Number,
            required: [true, "Order item must have a quantity"],
            min: [1, "Quantity must be at least 1"],
            max: [30, "Quantity cannot exceed 30"],
          },

          specialInstructions: {
            type: String,
            trim: true,
            default: "",
            maxlength: [500, "Special instructions too long"],
          },
        },
      ],
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    subtotal: {
      type: Number,
      required: [true, "Order must have a subtotal"],
      min: [0, "Subtotal cannot be negative"],
    },

    deliveryFee: {
      type: Number,
      required: true,
      min: [0, "Delivery fee cannot be negative"],
      default: 0,
    },

    tax: {
      type: Number,
      required: true,
      min: [0, "Tax cannot be negative"],
      default: 0,
    },

    total: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },

    deliveryAddress: {
      street: {
        type: String,
        required: [true, "Delivery street is required"],
      },
      city: {
        type: String,
        required: [true, "Delivery city is required"],
      },
      zip: {
        type: String,
        default: "",
      },
      instructions: {
        type: String,
        default: "",
        maxlength: [500, "Instructions too long"],
      },
    },

    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "confirmed",
          "preparing",
          "ready",
          "delivering",
          "completed",
          "cancelled",
        ],
        message: "{VALUE} is not a valid order status",
      },
      default: "pending",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "online"],
      default: "cash",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },

    estimatedDelivery: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancelReason: {
      type: String,
      default: "",
      maxlength: [500, "Reason too long"],
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.pre("validate", function (next) {
  if (this.items && this.items.length > 0) {
    const roundToCents = (value) => Math.round(value * 100) / 100;

    this.subtotal = roundToCents(
      this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
      ),
    );

    // Calculate tax (13%)
    this.tax = roundToCents(this.subtotal * 0.13);

    // Calculate total
    this.total = roundToCents(this.subtotal + this.tax + this.deliveryFee);
  }

  next();
});

orderSchema.virtual("itemCount").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

orderSchema.virtual("isCancellable").get(function () {
  return !["completed", "cancelled"].includes(this.status);});

// Enable virtuals
orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

// Indexes
orderSchema.index({ customer: 1, status: 1 });
orderSchema.index({ restaurant: 1, status: 1 });
orderSchema.index({ deliveryPartner: 1, status: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
