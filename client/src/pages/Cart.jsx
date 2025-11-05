import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isDark, setIsDark] = useState(false);

  // 🌗 Watch theme
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

  // 🛒 Load cart items
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("campusCart")) || [];
    setCartItems(saved);
  }, []);

  // 🧹 Remove item
  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item._id !== id);
    setCartItems(updated);
    localStorage.setItem("campusCart", JSON.stringify(updated));
    toast.success("Removed from cart 🗑️");
  };

  // 🛍️ Empty state
  if (cartItems.length === 0) {
    return (
      <main
        className={`min-h-screen flex flex-col items-center justify-center text-center transition-colors duration-500 ${
          isDark ? "bg-[#0f0f0f] text-gray-200" : "bg-white text-gray-800"
        }`}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
          alt="Empty cart"
          className="w-32 mb-6 opacity-80"
        />
        <h2 className="text-2xl font-bold mb-2">Your Cart is Empty 🛒</h2>
        <p className="text-gray-500 mb-6">
          Add some products to your cart to see them here.
        </p>
        <button
          onClick={() => navigate("/explore")}
          className={`px-6 py-3 rounded-xl font-semibold shadow-md ${
            isDark
              ? "bg-gray-100 text-black hover:bg-gray-200"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          Explore Products →
        </button>
      </main>
    );
  }

  return (
    <main
      className={`pt-24 min-h-screen transition-colors duration-500 ${
        isDark ? "bg-[#0b0b0b] text-gray-100" : "bg-[#fafafa] text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-12 text-center tracking-tight">
          Your Cart 🛍️
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {cartItems.map((item, i) => (
              <motion.div
                key={item._id || i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.25 }}
                onClick={() => navigate(`/product/${item._id}`)}
                className={`relative rounded-3xl overflow-hidden border shadow-lg cursor-pointer group transition-all duration-500 ${
                  isDark
                    ? "bg-[#161616] border-gray-800 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    : "bg-white border-gray-200 hover:shadow-[0_0_25px_rgba(0,0,0,0.1)]"
                }`}
              >
                {/* Product Image */}
                <div className="relative w-full h-64 overflow-hidden">
                  <motion.img
                    src={
                      item.image ||
                      "https://cdn-icons-png.flaticon.com/512/679/679720.png"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay Info on Hover */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 text-white ${
                      isDark ? "from-black/80" : "from-black/50"
                    }`}
                  >
                    <h2 className="text-lg font-bold truncate">{item.name}</h2>
                    <p className="text-sm opacity-90">
                      ₹{item.price?.toFixed(2)}
                    </p>
                  </motion.div>
                </div>

                {/* Details Section (25%) */}
                <div
                  className={`p-4 flex flex-col justify-between bg-gradient-to-br ${
                    isDark
                      ? "from-[#181818] to-[#131313]"
                      : "from-gray-50 to-white"
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm mb-2 line-clamp-2 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {item.description?.length > 80
                        ? item.description.slice(0, 80) + "..."
                        : item.description || "No description"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item._id);
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition-all ${
                        isDark
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      Remove
                    </motion.button>
                    <span
                      className={`text-xs font-medium tracking-wide ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Tap to view →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-16">
          <button
            onClick={() => navigate("/explore")}
            className={`px-6 py-3 rounded-xl font-semibold shadow-md transition-all ${
              isDark
                ? "bg-gray-100 text-black hover:bg-gray-200"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            Continue Shopping →
          </button>
        </div>
      </div>
    </main>
  );
};

export default Cart;