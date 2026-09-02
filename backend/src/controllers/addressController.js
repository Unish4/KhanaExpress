import mongoose from "mongoose";
import Address from "../models/Address.js";

const DEFAULT_ADDRESS_CONFLICT_ERROR =
  "A user can only have one default address";

const runRetriedTransaction = async (operation) => {
  const session = await mongoose.startSession();

  try {
    const retryableLabels = new Set([
      "TransientTransactionError",
      "UnknownTransactionCommitResult",
    ]);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        let result;

        await session.withTransaction(async () => {
          result = await operation(session);
        });

        return result;
      } catch (error) {
        const errorLabels = error?.errorLabels ?? [];
        const isRetryable = errorLabels.some((label) =>
          retryableLabels.has(label),
        );

        if (!isRetryable || attempt === 2) {
          throw error;
        }
      }
    }
  } finally {
    await session.endSession();
  }
};

const applyDefaultAddressTransition = async (session, userId, address) => {
  await Address.updateMany(
    { user: userId, _id: { $ne: address._id } },
    { isDefault: false },
    { session },
  );

  address.isDefault = true;
  await address.save({ session });

  return address;
};

export const createAddress = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        error: "Only customers can manage addresses",
      });
    }

    const { label, street, city, zip, instructions, coordinates, isDefault } =
      req.body;

    if (!street || !city) {
      return res.status(400).json({
        success: false,
        error: "Please provide street and city",
      });
    }

    const addressCount = await Address.countDocuments({ user: req.user.id });

    let shouldBeDefault = isDefault === true || isDefault === "true";

    if (addressCount === 0) {
      shouldBeDefault = true;
    }

    const addressFactory = () =>
      Address.create({
        user: req.user.id,
        label: label || "home",
        street,
        city,
        zip: zip || "",
        instructions: instructions || "",
        coordinates: coordinates || { lat: 0, lng: 0 },
        isDefault: false,
      });

    let address;

    if (shouldBeDefault) {
      address = await runRetriedTransaction(async (session) => {
        const createdAddress = new Address({
          user: req.user.id,
          label: label || "home",
          street,
          city,
          zip: zip || "",
          instructions: instructions || "",
          coordinates: coordinates || { lat: 0, lng: 0 },
          isDefault: false,
        });

        await createdAddress.save({ session });
        return applyDefaultAddressTransition(session, req.user.id, createdAddress);
      });
    } else {
      address = await addressFactory();
    }

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: address,
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
        error: DEFAULT_ADDRESS_CONFLICT_ERROR,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getAddresses = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        error: "Only customers can view addresses",
      });
    }

    const addresses = await Address.find({ user: req.user.id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getAddress = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        error: "Only customers can view addresses",
      });
    }

    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    if (address.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You can only view your own addresses",
      });
    }

    return res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid address ID format",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        error: "Only customers can manage addresses",
      });
    }

    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    if (address.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own addresses",
      });
    }

    const { user, isDefault, ...updateData } = req.body;
    const wantsDefault = isDefault === true || isDefault === "true";

    if (isDefault !== undefined && !wantsDefault) {
      return res.status(400).json({
        success: false,
        error: "Use the default-address endpoint to change isDefault",
      });
    }

    let updatedAddress;

    if (wantsDefault) {
      updatedAddress = await runRetriedTransaction(async (session) => {
        Object.assign(address, updateData);
        address.isDefault = false;

        await address.save({ session });

        return applyDefaultAddressTransition(session, req.user.id, address);
      });
    } else {
      updatedAddress = await Address.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true },
      );
    }

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress,
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
        error: "Invalid address ID format",
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: DEFAULT_ADDRESS_CONFLICT_ERROR,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        error: "Only customers can manage addresses",
      });
    }

    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    if (address.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own addresses",
      });
    }

    await Address.findByIdAndDelete(req.params.id);

    if (address.isDefault) {
      const nextAddress = await Address.findOne({ user: req.user.id }).sort({
        createdAt: 1,
      });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid address ID format",
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: DEFAULT_ADDRESS_CONFLICT_ERROR,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        error: "Only customers can manage addresses",
      });
    }

    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    if (address.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own addresses",
      });
    }

    const updatedAddress = await runRetriedTransaction(async (session) =>
      applyDefaultAddressTransition(session, req.user.id, address),
    );

    return res.status(200).json({
      success: true,
      message: "Default address updated",
      data: updatedAddress,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid address ID format",
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: DEFAULT_ADDRESS_CONFLICT_ERROR,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getDefaultAddress = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        error: "Only customers can view addresses",
      });
    }

    const defaultAddress = await Address.findOne({
      user: req.user.id,
      isDefault: true,
    });

    if (!defaultAddress) {
      return res.status(404).json({
        success: false,
        error: "No default address found",
      });
    }

    return res.status(200).json({
      success: true,
      data: defaultAddress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
