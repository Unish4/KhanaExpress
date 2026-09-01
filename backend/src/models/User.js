import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [50, "Name must be at most 50 characters long"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ["customer", "restaurant", "delivery", "admin"],
        message: "{VALUE} is not a valid role",
      },
      default: "customer",
    },

    avatar: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-]{10,15}$/, "Please provide a valid phone number"],
      default: "",
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },

    vehicle: {
      type: String,
      enum: ["bike", "car", "scooter", "cycling"],
      default: null,
    },

    licenseNumber: {
      type: String,
      trim: true,
      default: "",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    favoriteRestaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],

    favoriteDishes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 });

userSchema.index({ role: 1 });

userSchema.index({ role: 1, isActive: 1 });

const User = mongoose.model("User", userSchema);

export default User;
