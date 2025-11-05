import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageCircle, X } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const SellerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [glowActive, setGlowActive] = useState(false); // 🌈 mobile tap glow state

  // 🌗 Watch theme mode
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

  // 🧠 Fetch Seller + Products
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const userRes = await api.get(`/api/users/${id}`);
        setSeller(userRes.data);

        const productRes = await api.get(`/api/products/seller/${id}`);
        setProducts(productRes.data || []);
      } catch (error) {
        console.error("❌ Error loading seller:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSellerData();
  }, [id]);

  // 💬 Message Seller
  const handleMessageSeller = async () => {
    if (!user) {
      toast.error("Please log in to message ⚡");
      navigate("/login");
      return;
    }

    // 💥 Trigger glow on mobile tap
    setGlowActive(true);
    setTimeout(() => setGlowActive(false), 500);

    try {
      await api.post(
        "/api/chats",
        { userId: seller._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const msg = `Hi ${seller.name}, I’m ${user.name}. I’m interested in connecting!`;
      setTimeout(() => navigate(`/chat/${seller._id}?msg=${encodeURIComponent(msg)}`), 250);
    } catch (err) {
      console.error("Chat error:", err);
      toast.error("Failed to start chat 💬");
    }
  };

  // 🌀 Loader
  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#171717]" : "bg-white"
        }`}
      >
        <div className="w-10 h-10 border-4 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
      </div>
    );

  // 🚫 Not Found
  if (!seller)
    return (
      <div
        className={`min-h-screen flex items-center justify-center text-lg ${
          isDark ? "text-gray-400 bg-[#0f0f0f]" : "text-gray-500 bg-white"
        }`}
      >
        Seller not found 🙈
      </div>
    );

  return (
    <main
      className={`pt-24 min-h-screen px-4 transition-colors duration-500 pb-28 ${
        isDark ? "bg-[#151515] text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        {/* 🔙 Back Button */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-full shadow-sm transition-all ${
              isDark
                ? "bg-white/10 hover:bg-white/20 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold tracking-tight">Profile</h2>
        </div>

        {/* 🧑 Seller Info Section */}
        <div
          className={`rounded-2xl border shadow-md flex items-center justify-between gap-4 sm:gap-6 px-4 sm:px-6 py-5 mb-10 transition-all ${
            isDark
              ? "bg-[#1a1a1a]/90 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
          style={{
            flexWrap: "nowrap",
            alignItems: "center",
          }}
        >
          {/* Left: Details */}
          <div
            className="flex-1 overflow-hidden text-left sm:text-left"
            style={{
              minWidth: "0",
            }}
          >
            <h1 className="text-2xl font-bold truncate">{seller.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 truncate">
              {seller.stream
                ? `${seller.stream} • ${seller.year} Year`
                : "Student"}
            </p>
            <p
              className={`mt-3 text-sm italic leading-snug ${
                isDark ? "text-gray-400" : "text-gray-600"
              } line-clamp-3`}
            >
              {seller.bio || "No bio available"}
            </p>

            {/* 💬 Message Button — Glow + Tap Pulse */}
            <button
              onClick={handleMessageSeller}
              className={`mt-4 px-5 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 justify-center relative overflow-hidden group transition-all duration-300`}
            >
              {/* Glow background */}
              <span
                className={`absolute inset-0 rounded-lg blur-[8px] transition-opacity duration-500 ${
                  glowActive || false
                    ? "opacity-80"
                    : "opacity-0 group-hover:opacity-80"
                } ${
                  isDark
                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                    : "bg-gradient-to-r from-blue-600 via-purple-500 to-pink-400"
                }`}
              ></span>

              {/* Main layer */}
              <span
                className={`relative z-10 flex items-center gap-2 px-5 py-2 rounded-lg font-semibold border transition-all duration-300 ${
                  isDark
                    ? "border-gray-600 text-white bg-[#1a1a1a] hover:border-transparent"
                    : "border-gray-300 text-gray-900 bg-white hover:border-transparent"
                }`}
              >
                <MessageCircle
                  size={18}
                  className={`transition-transform duration-300 group-hover:scale-110 ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                Message
              </span>
            </button>
          </div>

          {/* Right: Profile Pic */}
          <div
            className="flex justify-end shrink-0 cursor-pointer"
            onClick={() => setShowImage(true)}
            style={{
              flexBasis: "auto",
            }}
          >
            <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-orange-400 hover:scale-105 transition-transform duration-300">
              <img
                src={
                  seller.profilePic ||
                  `https://ui-avatars.com/api/?name=${seller.name}&background=random`
                }
                alt="Seller"
                className="rounded-full object-cover border-4 border-white dark:border-[#1a1a1a]"
                style={{
                  width: "clamp(70px, 18vw, 120px)",
                  height: "clamp(70px, 18vw, 120px)",
                  transition: "width 0.3s ease, height 0.3s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* 🛍️ Seller’s Products */}
        <h2 className="text-xl sm:text-2xl font-semibold mb-5 text-center sm:text-left">
          Products by {seller.name}
        </h2>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076500.png"
              alt="Empty"
              className="w-28 h-28 mb-4 opacity-80"
            />
            <p
              className={`text-base ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No products listed by this seller yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product._id}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.25 }}
                onClick={() => navigate(`/product/${product._id}`)}
                className={`rounded-2xl overflow-hidden shadow-md cursor-pointer border relative group transition-all ${
                  isDark
                    ? "bg-[#1c1c1c] border-gray-700 hover:bg-[#232323]"
                    : "bg-white border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="relative w-full h-40 overflow-hidden">
                  <img
                    src={
                      product.image ||
                      "https://cdn-icons-png.flaticon.com/512/679/679720.png"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.isSold && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-lg shadow">
                      SOLD
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-sm sm:text-base truncate">
                    {product.name}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    ₹{product.price?.toFixed(2) || "N/A"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 🖼️ Fullscreen Image Modal */}
      <AnimatePresence>
        {showImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999]"
          >
            <motion.img
              src={
                seller.profilePic ||
                `https://ui-avatars.com/api/?name=${seller.name}&background=random`
              }
              alt="Full Seller Pic"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-[90%] max-h-[85%] rounded-2xl object-contain shadow-lg"
            />
            <button
              onClick={() => setShowImage(false)}
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

export default SellerProfile;