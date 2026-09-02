import express from "express";
import {
  createAddress,
  getAddresses,
  getAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
} from "../controllers/addressController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.use(authorize("customer"));

router.get("/default", getDefaultAddress);

router.route("/").get(getAddresses).post(createAddress);

router.route("/:id").get(getAddress).put(updateAddress).delete(deleteAddress);

router.patch("/:id/default", setDefaultAddress);

export default router;
