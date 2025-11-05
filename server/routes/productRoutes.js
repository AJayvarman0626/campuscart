import express from "express";
import multer from "multer";
import {
  getProducts,
  getProductsBySeller,
  createProduct,
  getProductById,
  deleteProduct,
  updateProduct,
  uploadProductImage,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🧠 In-memory multer (for Cloudinary buffer uploads)
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Image Upload (private)
router.post("/upload", protect, upload.single("image"), uploadProductImage);

// ✅ Product by Seller (must come before /:id)
router.get("/seller/:id", getProductsBySeller);

// ✅ Product Routes
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;