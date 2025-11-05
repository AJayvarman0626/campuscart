import asyncHandler from "express-async-handler";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

// 📩 Get all chats for logged-in user
export const getChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const chats = await Chat.find({ users: { $in: [userId] } })
    .populate("users", "name profilePic email")
    .populate({
      path: "lastMessage",
      populate: { path: "sender receiver", select: "name profilePic" },
    })
    .sort({ updatedAt: -1 });

  res.status(200).json(chats);
});

// 💬 Create or get chat between two users
export const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send("User ID required");

  let chat = await Chat.findOne({
    users: { $all: [req.user._id, userId] },
  })
    .populate("users", "name profilePic email")
    .populate("lastMessage");

  if (!chat) {
    chat = await Chat.create({ users: [req.user._id, userId] });
    chat = await Chat.findById(chat._id).populate("users", "name profilePic");
  }

  res.status(200).json(chat);
});

// 💬 Get a full chat with messages (GET /api/chats/:userId)
export const getChatById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: "User ID required" });

  let chat = await Chat.findOne({
    users: { $all: [req.user._id, userId] },
  });

  if (!chat) {
    chat = await Chat.create({ users: [req.user._id, userId] });
  }

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id },
    ],
  }).sort({ createdAt: 1 });

  const receiver = await User.findById(userId).select(
    "name email profilePic stream"
  );

  res.status(200).json({
    chat,
    receiver,
    messages,
  });
});

// 📨 Send a message (POST /api/chats/message)
export const sendMessage = asyncHandler(async (req, res) => {
  const { content, receiver } = req.body;
  if (!content || !receiver)
    return res.status(400).json({ message: "Missing content or receiver" });

  const message = await Message.create({
    sender: req.user._id,
    receiver,
    content,
  });

  let chat = await Chat.findOne({ users: { $all: [req.user._id, receiver] } });
  if (!chat) {
    chat = await Chat.create({ users: [req.user._id, receiver] });
  }

  chat.lastMessage = message._id;
  await chat.save();

  res.status(201).json(message);
});

// 🧹 Delete entire chat (DELETE /api/chats/:userId)
export const clearChat = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // find the chat between the two users
  const chat = await Chat.findOne({
    users: { $all: [req.user._id, userId] },
  });

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  // delete all related messages
  await Message.deleteMany({
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id },
    ],
  });

  // delete the chat document itself
  await Chat.findByIdAndDelete(chat._id);

  res.status(200).json({ message: "Chat and messages deleted successfully" });
});