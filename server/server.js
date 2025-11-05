// server.js — CampusCart 2.2 (Render-Proof, Final)
import express from "express";
import dotenv from "dotenv";
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

// ---------- ⚙️ Allowed Origins ----------
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : [
      "https://campuscart-fl2c.onrender.com",
      "https://campuscart-crko.onrender.com",
      "http://localhost:5173",
    ];

console.log("✅ Allowed Origins:", allowedOrigins);

// ---------- 🔥 Manual CORS Middleware (Render-Safe) ----------
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ---------- Middleware ----------
app.use(express.json());
app.use(morgan("dev"));

// ---------- Root Routes ----------
app.get("/", (req, res) => res.status(200).send("CampusCart API running 🛒"));
app.get("/ping", (req, res) => res.status(200).send("pong 🧠"));
app.head("/ping", (req, res) => res.sendStatus(200));

// ---------- ✅ Debug Route for CORS Testing ----------
app.get("/debug/cors", (req, res) => {
  const origin = req.headers.origin || "No origin header";
  res.json({
    message: "CORS debug info",
    requestOrigin: origin,
    allowedOrigins,
    corsAllowed: allowedOrigins.includes(origin),
  });
});

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
    transports: ["websocket", "polling"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("joinChat", (userId) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  socket.on("sendMessage", (msg) => {
    if (!msg?.sender || !msg?.receiver) return;

    io.to(msg.receiver).emit("newMessage", msg);
    io.to(msg.sender).emit("messageSent", {
      _id: msg._id,
      content: msg.content,
      createdAt: msg.createdAt || new Date().toISOString(),
    });

    console.log(`📨 Message from ${msg.sender} ➜ ${msg.receiver}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔴 Socket disconnected (${reason}):`, socket.id);
  });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (CampusCart Chat Live)`);
});