import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must have a user"],
      index: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
      validate: {
        validator: function (value) {
          return value != null || this.menuItem != null;
        },
        message: "Review must reference a restaurant or a menu item",
      },
    },

    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      default: null,
      validate: {
        validator: function (value) {
          return value != null || this.restaurant != null;
        },
        message: "Review must reference a restaurant or a menu item",
      },
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Review must be linked to an order"],
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment too long"],
      default: "",
    },

    images: [
      {
        url: String,
        publicId: String,
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ user: 1, order: 1, menuItem: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
