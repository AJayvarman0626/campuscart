import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getChats,
  getChatById,
  accessChat,
  sendMessage,
  clearChat,
} from "../controllers/chatController.js";

const router = express.Router();

router.route("/").get(protect, getChats).post(protect, accessChat);
router.route("/message").post(protect, sendMessage);
router.route("/:userId").get(protect, getChatById).delete(protect, clearChat);

export default router;