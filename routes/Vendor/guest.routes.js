import express from "express";
import authMiddleware from "../../middleware/adminAuth.js";
import { AddGuest, GetGuestDetails, UpdateGuest } from "../../controllers/Vendor/vendor.js";

const router = express.Router();

router.post("/add", AddGuest);
router.patch("/edit/:id", UpdateGuest);
// router.get("/list", authMiddleware, GetGuest);
router.get("/getGuestDetails", GetGuestDetails);

export default router;
