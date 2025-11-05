// server.js — CampusCart 2.0
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// ---------- ENV + DB ----------
dotenv.config();
connectDB();

// ---------- Setup ----------
const app = express();
const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- Define Allowed Origins ----------
const allowedOrigins = [
  "https://campuscart-crko.onrender.com", // your current frontend (Render)
  "https://campuscart-2-0.onrender.com",  // backup Render URL (optional)
  "http://localhost:5173",                // dev environment
];

// ---------- CORS for REST + Socket.io ----------
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(morgan("dev"));

// ---------- Root Routes ----------
app.get("/", (req, res) => res.status(200).send("CampusCart API running 🛒"));
app.get("/ping", (req, res) => res.status(200).send("pong 🧠"));
app.head("/ping", (req, res) => res.sendStatus(200));

// ---------- API Routes ----------
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chats", chatRoutes);

// ---------- Error Handling ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Socket.io Setup ----------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // user joins chat room
  socket.on("joinChat", (userId) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  // message handling
  socket.on("sendMessage", (msg) => {
    if (msg?.receiver) io.to(msg.receiver).emit("newMessage", msg);
    if (msg?.sender) io.to(msg.sender).emit("newMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (CampusCart Chat Live)`);
});