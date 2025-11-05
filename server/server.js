// server.js — CampusCart 2.0 (Render-Stable Final)
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

// ---------- Allowed Origins ----------
const allowedOrigins = [
  "https://campuscart-fl2c.onrender.com", // ✅ your current live frontend
  "https://campuscart-crko.onrender.com", // old one
  "https://campuscart-2-0.onrender.com",  // backup
  "http://localhost:5173",                // dev
];

// ---------- CORS (Render-Proof) ----------
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
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

// 🧩 Handle preflight requests (Render-safe)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    return res.sendStatus(204);
  }
  next();
});

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

  socket.on("joinChat", (userId) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

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
  console.log("✅ Allowed Origins:", allowedOrigins);
});