import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// ---------- ENV + DB ----------
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ---------- CORS Setup ----------
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("🚫 Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

// ✅ Handle preflight (OPTIONS) requests globally
app.options("*", cors());

// ---------- Middleware ----------
app.use(express.json());
app.use(morgan("dev"));

// ---------- API Routes ----------
app.get("/", (req, res) => res.send("🛒 CampusCart API is alive and running!"));
app.get("/ping", (req, res) => res.send("pong 🧠"));

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chats", chatRoutes);

// ---------- Error Handlers ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Socket.io Setup ----------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("joinChat", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`👤 User joined room: ${userId}`);
    }
  });

  socket.on("sendMessage", (msg) => {
    if (!msg?.sender || !msg?.receiver) return;
    io.to(msg.receiver).emit("newMessage", msg);
    io.to(msg.sender).emit("messageSent", msg);
    console.log(`📨 ${msg.sender} ➜ ${msg.receiver}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (CampusCart Service Live)`);
  console.log("✅ Allowed Origins:", allowedOrigins);
});