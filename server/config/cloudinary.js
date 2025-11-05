import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// ✅ Load .env before Cloudinary config
dotenv.config();

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("🚨 Missing Cloudinary environment variables!");
} else {
  console.log("✅ Cloudinary env loaded correctly");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;