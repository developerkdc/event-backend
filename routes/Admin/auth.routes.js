import express from "express";
import { GetUserDetail, LoginUser, ResetPassword, SendOTP, UpdateProfile, VerifyOTPAndUpdatePassword } from "../../controllers/Admin/auth.js";
import authMiddleware from "../../middleware/adminAuth.js";


const router = express.Router();

router.post("/login", LoginUser);
router.post("/forgot-password", SendOTP);
router.post("/verify-otp", VerifyOTPAndUpdatePassword);
router.patch("/update-profile",authMiddleware, UpdateProfile);
router.get("/get-user",authMiddleware, GetUserDetail);
router.patch("/reset-password",authMiddleware, ResetPassword);


export default router;