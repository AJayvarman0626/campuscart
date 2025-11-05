import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // 🌗 Theme Sync
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

  // 🧠 Fetch Product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product", err);
        toast.error("Product not found ❌");
        navigate("/explore");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  // 🛒 Add to Cart
  const handleAddToCart = () => {
    try {
      const existingCart = JSON.parse(localStorage.getItem("campusCart")) || [];
      const alreadyInCart = existingCart.some(
        (item) => item._id === product._id
      );
      if (alreadyInCart) {
        toast("🛒 Already in your cart!", { icon: "✅" });
        return;
      }
      const newItem = {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      };
      localStorage.setItem(
        "campusCart",
        JSON.stringify([...existingCart, newItem])
      );
      toast.success("Added to Cart 🛍️");
    } catch (error) {
      console.error("Cart error:", error);
      toast.error("Failed to add to cart 💔");
    }
  };

  // 💬 Message Seller
  const handleMessageSeller = async () => {
    if (!user) {
      toast.error("Please log in to message the seller ⚡");
      navigate("/login");
      return;
    }

    try {
      await api.post(
        "/api/chats",
        { userId: product.seller._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const greeting = `Hi ${product.seller.name}, I’m ${user.name}. I’m interested in buying your product "${product.name}".`;
      navigate(`/chat/${product.seller._id}?msg=${encodeURIComponent(greeting)}`);
    } catch (err) {
      console.error("Failed to open chat:", err);
      toast.error("Unable to start chat 💬");
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#171717]" : "bg-white"
        }`}
      >
        <div className="w-10 h-10 border-4 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "text-gray-400 bg-[#0f0f0f]" : "text-gray-500 bg-white"
        }`}
      >
        Product not found.
      </div>
    );
  }

  return (
    <main
      className={`pt-24 min-h-screen flex justify-center px-4 sm:px-6 transition-colors duration-500 pb-28 ${
        isDark ? "bg-[#151515] text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`w-full max-w-5xl rounded-2xl shadow-lg border overflow-hidden ${
          isDark
            ? "bg-[#1a1a1a]/90 border-gray-800"
            : "bg-white/90 border-gray-200"
        }`}
      >
        {/* 🖼️ Product Display */}
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 relative">
            <img
              src={
                product.image ||
                "https://cdn-icons-png.flaticon.com/512/679/679720.png"
              }
              alt={product.name}
              onClick={() => setShowImageModal(true)}
              className="w-full h-72 md:h-full object-cover cursor-zoom-in"
            />
          </div>

          {/* 📄 Info */}
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {product.name}
              </h1>
              <p
                className={`text-sm mb-3 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Category:{" "}
                <span className="font-semibold text-pink-500">
                  {product.category}
                </span>
              </p>
              <p
                className={`text-base leading-relaxed ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {product.description}
              </p>
            </div>

            {/* 💰 Price & Buttons */}
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3">
              <p
                className={`text-2xl font-bold mb-2 sm:mb-0 sm:mr-4 ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
              >
                ₹{product.price?.toFixed(2) || "N/A"}
              </p>

              {!product.isSold && (
                <>
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 px-5 py-3 rounded-xl font-semibold shadow-md transition-all ${
                      isDark
                        ? "bg-gray-100 text-black hover:bg-gray-200"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    onClick={handleMessageSeller}
                    className={`flex-1 px-5 py-3 rounded-xl font-semibold shadow-md transition-all ${
                      isDark
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    💬 Message Seller
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 👤 Seller Info (clickable entire section) */}
        {product.seller && (
          <div
            onClick={() => navigate(`/seller/${product.seller._id}`)}
            className={`border-t p-6 flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-all duration-300 ${
              isDark
                ? "border-gray-700 bg-[#121212] hover:bg-[#181818]"
                : "border-gray-200 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <img
              src={
                product.seller.profilePic ||
                `https://ui-avatars.com/api/?name=${product.seller.name}&background=random`
              }
              alt="Seller"
              className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600 object-cover shadow-md"
            />
            <div>
              <p className="font-bold text-lg">{product.seller.name}</p>
              <p
                className={`text-sm mb-1 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {product.seller.stream
                  ? `${product.seller.stream} • ${product.seller.year} Year`
                  : "Seller"}
              </p>
              <p
                className={`text-sm italic ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {product.seller.bio || "No bio available"}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* 🖼️ Fullscreen Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999]"
          >
            <motion.img
              src={product.image}
              alt="Full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-[95%] max-h-[85%] object-contain rounded-lg shadow-lg"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-6 right-6 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-lg"
            >
              <X size={22} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default ProductDetails;