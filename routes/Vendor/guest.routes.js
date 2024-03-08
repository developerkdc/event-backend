import express from "express";
import authMiddleware from "../../middleware/adminAuth.js";
import { AddGuest, GetGuestDetails } from "../../controllers/Vendor/vendor.js";

const router = express.Router();

router.post("/add", AddGuest);
// router.get("/list", authMiddleware, GetGuest);
router.get("/getGuestDetails", GetGuestDetails);

export default router;
