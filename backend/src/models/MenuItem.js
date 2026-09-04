import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Menu item must belong to a restaurant"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Dish name is required"],
      trim: true,
      minlength: [2, "Name too short"],
      maxlength: [100, "Name too long"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description too long"],
      default: "",
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      max: [10000, "Price too high"],
    },

    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    isVegetarian: {
      type: Boolean,
      default: false,
    },

    isVegan: {
      type: Boolean,
      default: false,
    },

    spicyLevel: {
      type: Number,
      default: 0,
      min: [0, "Spicy level cannot be negative"],
      max: [3, "Spicy level max is 3"],
    },

    ingredients: {
      type: [String],
      default: [],
    },

    available: {
      type: Boolean,
      default: true, // Is this dish currently available?
    },

    preparationTime: {
      type: Number, // Minutes to prepare
      default: 15,
      min: [1, "Preparation time min 1 minute"],
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

menuItemSchema.index({ restaurant: 1, category: 1 });

menuItemSchema.index({ name: "text", description: "text" });

const MenuItem = mongoose.model("MenuItem", menuItemSchema);
export default MenuItem;
