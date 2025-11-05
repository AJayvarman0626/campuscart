import Product from "../models/productModel.js";
import cloudinary from "../config/cloudinary.js";

/**
 * ✅ Upload Product Image
 * POST /api/products/upload
 * Private
 */
export const uploadProductImage = async (req, res, next) => {
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
    return res.status(500).json({ message: "Cloudinary upload failed", error: error.message });
  }
};

/**
 * ✅ Get all products (search, sort, pagination)
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
    const { sort } = req.query;
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "name_asc") sortOption = { name: 1 };
    if (sort === "name_desc") sortOption = { name: -1 };

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
    console.error("❌ Error fetching products:", error);
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
 * ✅ Create a new product
 * POST /api/products
 * Private
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, image } = req.body;

    // basic validation
    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({ message: "All fields (name, description, price, category) are required" });
    }

    // parse price
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    const seller = req.user._id;
    let finalImageUrl = "";

    // If the client sent a data URI (starts with "data:"), upload to Cloudinary.
    // If client passed a remote/cloudinary URL, keep it.
    if (image && typeof image === "string") {
      if (image.startsWith("data:")) {
        const uploadResult = await cloudinary.uploader.upload(image, {
          folder: "CampusCart/Products",
          resource_type: "auto",
        });
        finalImageUrl = uploadResult.secure_url;
      } else {
        // assume the URL is usable (could be a direct cloudinary URL or other host)
        finalImageUrl = image;
      }
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category,
      image: finalImageUrl || undefined,
      seller,
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
 * ✅ Get single product
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

    res.status(200).json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    next(error);
  }
};

/**
 * ✅ Update product
 * PUT /api/products/:id
 * Private (seller only)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { name, description, price, category, image, isSold } = req.body;

    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ message: "Invalid price" });
      }
      product.price = parsedPrice;
    }
    if (category) product.category = category;
    product.isSold = isSold !== undefined ? Boolean(isSold) : product.isSold;

    // If new image provided and different from existing:
    if (image && image !== product.image) {
      // Delete old image from cloudinary if it looks like a cloudinary URL
      try {
        if (product.image && product.image.includes("res.cloudinary.com")) {
          // get public id path after '/upload/'
          const parts = product.image.split("/upload/");
          if (parts.length > 1) {
            const afterUpload = parts[1];
            // strip extension and any query params
            const publicId = afterUpload.split(".")[0].split("?")[0];
            if (publicId) {
              await cloudinary.uploader.destroy(publicId, { resource_type: "image" }).catch((e) => {
                // don't crash on delete failure; log it
                console.warn("Cloudinary destroy warning:", e.message || e);
              });
            }
          }
        }
      } catch (err) {
        console.warn("Failed to remove old Cloudinary image:", err.message || err);
      }

      // If incoming image is data URI -> upload; else keep URL
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
    const populated = await updatedProduct.populate(
      "seller",
      "name email whatsappNumber profilePic"
    );

    res.status(200).json(populated);
  } catch (error) {
    console.error("❌ Error updating product:", error);
    next(error);
  }
};

/**
 * ✅ Delete product
 * DELETE /api/products/:id
 * Private (seller only)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // delete cloudinary asset if present
    try {
      if (product.image && product.image.includes("res.cloudinary.com")) {
        const parts = product.image.split("/upload/");
        if (parts.length > 1) {
          const afterUpload = parts[1];
          const publicId = afterUpload.split(".")[0].split("?")[0];
          if (publicId) {
            await cloudinary.uploader.destroy(publicId, { resource_type: "image" }).catch((e) => {
              console.warn("Cloudinary destroy warning:", e.message || e);
            });
          }
        }
      }
    } catch (err) {
      console.warn("Failed to remove Cloudinary image on delete:", err.message || err);
    }

    await product.deleteOne();
    res.status(200).json({ message: "🗑️ Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    next(error);
  }
};