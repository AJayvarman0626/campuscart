import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { sendMessage } from "../controllers/chatController.js";

const router = express.Router();

// 📨 Send a message
router.post("/", protect, sendMessage);

export default router;