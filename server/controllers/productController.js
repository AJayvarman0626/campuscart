import Product from "../models/productModel.js";
import cloudinary from "../config/cloudinary.js";
import { getRecommendedCategory } from "../utils/mlService.js";

/**
 * 🔁 ML category code → DB category string
 */
const CATEGORY_MAP = {
  0: "Notes",
  1: "Books",
  2: "Gadgets",
};

/**
 * 🔁 DB category string → ML category code
 */
const CATEGORY_TO_CODE = {
  Notes: 0,
  Books: 1,
  Gadgets: 2,
};

/**
 * ✅ Upload Product Image
 * POST /api/products/upload
 * Private
 */
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const base64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: "CampusCart/Products",
      resource_type: "auto",
    });

    res.status(200).json({ url: uploadResult.secure_url });
  } catch (error) {
    console.error("❌ Product image upload failed:", error);
    res.status(500).json({ message: "Cloudinary upload failed" });
  }
};

/**
 * ✅ Get all products
 * GET /api/products
 * Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const pageSize = 9;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: "i" } },
            { category: { $regex: req.query.keyword, $options: "i" } },
          ],
        }
      : {};

    let sortOption = { createdAt: -1 };
    if (req.query.sort === "price_asc") sortOption = { price: 1 };
    if (req.query.sort === "price_desc") sortOption = { price: -1 };

    const count = await Product.countDocuments({ ...keyword });

    const products = await Product.find({ ...keyword })
      .populate("seller", "name email whatsappNumber profilePic")
      .sort(sortOption)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get single product by ID + ML recommendations
 * GET /api/products/:id
 * Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name email whatsappNumber profilePic stream year bio"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🔥 Encode category for ML
    const predictedCategoryCode = await getRecommendedCategory({
      semester: product.semester,
      regulation: product.regulation,
      category: CATEGORY_TO_CODE[product.category],
    });

    // 🔥 Decode ML output to DB category
    const recommendedCategory =
      CATEGORY_MAP[predictedCategoryCode] || null;

    let recommendations = [];

    if (recommendedCategory) {
      recommendations = await Product.find({
        category: recommendedCategory,
        _id: { $ne: product._id },
        isSold: false,
      })
        .limit(5)
        .select("name price image category semester regulation");
    }

    res.status(200).json({
      product,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get products by specific seller
 * GET /api/products/seller/:id
 * Public
 */
export const getProductsBySeller = async (req, res, next) => {
  try {
    const sellerId = req.params.id;

    const products = await Product.find({ seller: sellerId })
      .populate("seller", "name email whatsappNumber profilePic stream year bio")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching seller products:", error);
    next(error);
  }
};

/**
 * ✅ Create Product
 * POST /api/products
 * Private
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      category,
      regulation,
      semester,
      image,
    } = req.body;

    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      !regulation ||
      semester === undefined
    ) {
      return res.status(400).json({
        message:
          "All fields are required (name, description, price, category, regulation, semester)",
      });
    }

    const parsedPrice = Number(price);
    const parsedSemester = Number(semester);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    if (isNaN(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
      return res.status(400).json({ message: "Invalid semester" });
    }

    let finalImageUrl = "";

    if (image && typeof image === "string") {
      if (image.startsWith("data:")) {
        const uploadResult = await cloudinary.uploader.upload(image, {
          folder: "CampusCart/Products",
          resource_type: "auto",
        });
        finalImageUrl = uploadResult.secure_url;
      } else {
        finalImageUrl = image;
      }
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category,
      regulation,
      semester: parsedSemester,
      image: finalImageUrl || undefined,
      seller: req.user._id,
    });

    const populatedProduct = await product.populate(
      "seller",
      "name email whatsappNumber profilePic"
    );

    res.status(201).json({
      message: "✅ Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    next(error);
  }
};

/**
 * ✅ Update Product
 * PUT /api/products/:id
 * Private
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const {
      name,
      description,
      price,
      category,
      regulation,
      semester,
      image,
      isSold,
    } = req.body;

    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (category) product.category = category;
    if (regulation) product.regulation = regulation;
    if (semester !== undefined) product.semester = Number(semester);
    if (isSold !== undefined) product.isSold = Boolean(isSold);

    if (image && image !== product.image) {
      if (typeof image === "string" && image.startsWith("data:")) {
        const uploadResult = await cloudinary.uploader.upload(image, {
          folder: "CampusCart/Products",
          resource_type: "auto",
        });
        product.image = uploadResult.secure_url;
      } else {
        product.image = image;
      }
    }

    const updatedProduct = await product.save();

    res.status(200).json(
      await updatedProduct.populate(
        "seller",
        "name email whatsappNumber profilePic"
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Delete Product
 * DELETE /api/products/:id
 * Private
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "🗑️ Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};
