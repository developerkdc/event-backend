import express from "express";
import authMiddleware from "../../middleware/adminAuth.js";
import { AddGuest, GetGuest, UpdateGuest } from "../../controllers/Admin/guest.js";

const router = express.Router();

router.post("/add", AddGuest);
router.patch("/edit/:id", authMiddleware, UpdateGuest);
router.get("/list", authMiddleware, GetGuest);

export default router;
