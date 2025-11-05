import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const SellerDashboard = () => {
  const { user } = useAuth();
  const fileInputRef = useRef();

  const [isDark, setIsDark] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [confirmSold, setConfirmSold] = useState(null);

  // 🌗 Live Theme Watcher
  useEffect(() => {
    const updateTheme = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // 🧾 Fetch seller's products
  const fetchMyProducts = async () => {
    try {
      const { data } = await api.get("/api/products", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const myProducts = data.products.filter(
        (p) => p.seller?._id === user._id
      );
      setProducts(myProducts);
    } catch (err) {
      toast.error("Failed to load products");
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchMyProducts();
  }, [user]);

  // 📸 Upload Image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await api.post("/api/products/upload", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setProduct({ ...product, image: data.url });
      setPreview(data.url);
      toast.success("Image uploaded ✅");
    } catch (err) {
      console.error("Upload Error:", err);
      toast.error("Image upload failed 💔");
    } finally {
      setUploading(false);
    }
  };

  // 💾 Add / Edit Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { data } = await api.put(`/api/products/${editingId}`, product, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? data : p))
        );
        toast.success("Product updated ✏️");
      } else {
        const { data } = await api.post("/api/products", product, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProducts((prev) => [data.product, ...prev]);
        toast.success("Product added 🛒");
      }

      setProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
      });
      setPreview(null);
      setEditingId(null);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save product 💔");
    }
  };

  // 🗑️ Delete Product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Deleted 🗑️");
    } catch (err) {
      toast.error("Failed to delete");
      console.error(err);
    }
  };

  // ✏️ Edit Product
  const handleEdit = (p) => {
    setEditingId(p._id);
    setProduct({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
    });
    setPreview(p.image);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Mark as Sold
  const markAsSold = async (id) => {
    try {
      await api.put(
        `/api/products/${id}`,
        { isSold: true },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isSold: true } : p))
      );
      toast.success("Marked as sold 🏷️");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark as sold");
    } finally {
      setConfirmSold(null);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center px-4 pt-24 pb-28 sm:pb-16 transition-colors duration-500 ${
        isDark ? "bg-[#0f0f0f] text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`w-full max-w-4xl rounded-3xl shadow-xl p-8 border transition-colors duration-300 ${
          isDark
            ? "bg-[#1a1a1a]/90 border-gray-800"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Seller Dashboard</h2>

        {/* 🧾 Upload/Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mb-10">
          <input
            type="text"
            placeholder="Product Name"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className={`w-full p-3 rounded-xl border outline-none focus:ring-2 ${
              isDark
                ? "bg-gray-800 border-gray-700 text-gray-100 focus:ring-gray-600"
                : "bg-gray-100 border-gray-300 text-gray-800 focus:ring-gray-400"
            }`}
            required
          />

          <textarea
            placeholder="Description"
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
            className={`w-full p-3 rounded-xl border outline-none focus:ring-2 ${
              isDark
                ? "bg-gray-800 border-gray-700 text-gray-100 focus:ring-gray-600"
                : "bg-gray-100 border-gray-300 text-gray-800 focus:ring-gray-400"
            }`}
          ></textarea>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Price ₹"
              value={product.price}
              onChange={(e) =>
                setProduct({ ...product, price: e.target.value })
              }
              className={`w-full p-3 rounded-xl border outline-none focus:ring-2 ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-gray-100 focus:ring-gray-600"
                  : "bg-gray-100 border-gray-300 text-gray-800 focus:ring-gray-400"
              }`}
              required
            />

            {/* 🎨 Category Dropdown (Aesthetic + Fixed Lab Coat) */}
            <div className="relative">
              <select
                value={product.category}
                onChange={(e) =>
                  setProduct({ ...product, category: e.target.value })
                }
                className={`w-full appearance-none p-3 rounded-xl border font-medium focus:ring-2 ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-gray-100 focus:ring-gray-600"
                    : "bg-gray-100 border-gray-300 text-gray-800 focus:ring-gray-400"
                }`}
                required
              >
                <option value="">Select Category</option>
                <option value="Books">📚 Books</option>
                <option value="Notes">🧾 Notes</option>
                <option value="Gadgets">⚙️ Gadgets</option>
                <option value="Lab Coat">🥼 Lab Coat</option> {/* ✅ Fixed */}
              </select>
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                ▼
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-28 h-28 rounded-md object-cover border dark:border-gray-700"
              />
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              className={`px-5 py-2 rounded-xl font-semibold transition-all ${
                isDark
                  ? "bg-gray-100 text-black hover:bg-gray-200"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              isDark
                ? "bg-gray-100 text-black hover:bg-gray-200"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {editingId ? "Save Changes" : "Add Product"}
          </button>
        </form>

        {/* 🛍️ Product List */}
        <h3 className="text-lg font-semibold mb-3">Your Products</h3>

        {products.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No products uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <motion.div
                key={p._id}
                whileHover={{ scale: 1.03 }}
                className={`p-4 rounded-xl border transition-colors ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                <img
                  src={p.image || "https://via.placeholder.com/200"}
                  alt={p.name}
                  className="w-full h-40 object-cover rounded-md mb-2"
                />
                <h4 className="font-semibold">{p.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {p.description}
                </p>
                <p className="mt-2 font-semibold">₹{p.price}</p>

                {p.isSold ? (
                  <p className="mt-2 text-sm bg-gray-600 text-white text-center py-1 rounded-md">
                    Sold Out 🏷️
                  </p>
                ) : (
                  <button
                    onClick={() => setConfirmSold(p._id)}
                    className="mt-2 w-full py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Mark as Sold ✅
                  </button>
                )}

                <div className="flex justify-between mt-2 text-sm">
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ⚠️ Confirm Mark Sold Modal */}
      {confirmSold && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-xl text-center shadow-lg border ${
              isDark
                ? "bg-[#1a1a1a] border-gray-700 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <p className="mb-4 text-lg font-medium">
              Are you sure you want to mark this as sold?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => markAsSold(confirmSold)}
                className="px-5 py-2 bg-green-600 text-white rounded-lg"
              >
                Yes ✅
              </button>
              <button
                onClick={() => setConfirmSold(null)}
                className="px-5 py-2 border border-gray-400 dark:border-gray-600 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;