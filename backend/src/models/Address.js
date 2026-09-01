import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Address must belong to a user"],
      index: true,
    },

    label: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },

    street: {
      type: String,
      required: [true, "Street is required"],
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

    instructions: {
      type: String,
      trim: true,
      maxlength: [500, "Instructions too long"],
      default: "",
    },

    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

addressSchema.index({ user: 1, isDefault: -1 });

const Address = mongoose.model("Address", addressSchema);
export default Address;
