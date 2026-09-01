import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [100, "Name must be at most 100 characters long"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be at most 500 characters long"],
      default: "",
    },

    cuisine: {
      type: [String],
      validate: {
        validator: function (cuisines) {
          return cuisines.length > 0; // At least one cuisine
        },
        message: "At least one cuisine type is required",
      },
      set: function (cuisines) {
        // Normalize: lowercase, trim, remove duplicates
        if (!Array.isArray(cuisines)) return [];
        return [
          ...new Set(
            cuisines
              .map((c) => c.toLowerCase().trim())
              .filter((c) => c.length > 0),
          ),
        ];
      },
    },

    image: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
      index: true,
    },

    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      zip: {
        type: String,
        trim: true,
        default: "",
      },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    hours: {
      open: {
        type: String,
        default: "09:00",
      },
      close: {
        type: String,
        default: "22:00",
      },
    },

    deliveryTime: {
      type: Number,
      default: 30, // in minutes
      min: [10, "Delivery time must be at least 10 minutes"],
      max: [120, "Delivery time must be at most 120 minutes"],
    },

    minimumFee: {
      type: Number,
      default: 0, // in currency units
      min: [0, "Minimum fee cannot be negative"],
    },

    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: [0, "Total reviews cannot be negative"],
    },

    isOpen: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: {
        values: ["active", "closed", "suspended"],
        message: "{VALUE} is not a valid status",
      },
      default: "active",
    },
  },

  {
    timestamps: true,
  },
);

restaurantSchema.virtual("isHighlyRated").get(function () {
  return this.rating >= 4.5 && this.totalReviews >= 50;
});

restaurantSchema.set("toJSON", { virtuals: true });
restaurantSchema.set("toObject", { virtuals: true });

restaurantSchema.index({ name: "text", description: "text", cuisine: "text" });

restaurantSchema.index({ cuisine: 1 });

restaurantSchema.index({ rating: -1 });

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
