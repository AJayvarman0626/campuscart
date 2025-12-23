import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // 🏷️ Product Name
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
    },

    // 🧾 Description
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    // 💰 Price
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be >= 0"],
    },

    // 📚 Category — added Lab Coat
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Books", "Notes", "Gadgets", "Lab Coat"],
    },
    // 🎓 Regulation (Academic Regulation)
    regulation: {
      type: String,
      required: [true, "Regulation is required"],
      enum: ["2021", "2025"],
    },
    // 📘 Semester (1 to 8)
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: [1, "Semester must be between 1 and 8"],
      max: [8, "Semester must be between 1 and 8"],
    },
    // 🖼️ Product Image (Cloudinary URL)
    image: {
      type: String,
      default: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    },

    // 🧑‍💼 Seller Reference
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ Status Flag
    isSold: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
    versionKey: false, // hides "__v"
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🌐 Virtual: Shortened description
productSchema.virtual("shortDescription").get(function () {
  return this.description && this.description.length > 80
    ? this.description.substring(0, 80) + "..."
    : this.description;
});

// 🧮 Virtual: Formatted price display (e.g., ₹500)
productSchema.virtual("formattedPrice").get(function () {
  try {
    return `₹${Number(this.price).toLocaleString("en-IN")}`;
  } catch {
    return `₹${this.price}`;
  }
});

const Product = mongoose.model("Product", productSchema);
export default Product;