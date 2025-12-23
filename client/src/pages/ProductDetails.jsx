import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { X } from "lucide-react";

/* 🔲 Skeleton Block */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse rounded-lg bg-gray-300/60 dark:bg-gray-700 ${className}`} />
);

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  /* 🌗 Theme Sync */
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

  /* 🧠 Fetch Product */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data.product);
        setRecommendations(data.recommendations || []);
      } catch (err) {
        toast.error("Product not found ❌");
        navigate("/explore");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  /* 🛒 Add to Cart */
  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("campusCart")) || [];
    if (cart.some((i) => i._id === product._id)) {
      toast("Already in cart 🛒", { icon: "✅" });
      return;
    }
    cart.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    localStorage.setItem("campusCart", JSON.stringify(cart));
    toast.success("Added to Cart 🛍️");
  };

  /* 💬 Message Seller */
  const handleMessageSeller = async () => {
    if (!user) {
      toast.error("Login required");
      navigate("/login");
      return;
    }

    await api.post(
      "/api/chats",
      { userId: product.seller._id },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    navigate(`/chat/${product.seller._id}`);
  };

  /* 🔲 SKELETON UI */
  if (loading) {
    return (
      <main className="pt-28 pb-32 px-4 max-w-6xl mx-auto">
        <div className="rounded-2xl border dark:border-gray-800 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <Skeleton className="md:w-1/2 h-80 md:h-[420px]" />
            <div className="md:w-1/2 p-6 space-y-4">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-32" />
              <div className="flex gap-3">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-12 w-40" />
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Skeleton */}
        <div className="mt-16">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`pt-28 pb-32 px-4 min-h-screen ${
        isDark ? "bg-[#151515] text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      {/* PRODUCT CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-5xl mx-auto rounded-2xl border shadow-lg overflow-hidden ${
          isDark ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2">
            <img
              src={product.image}
              alt={product.name}
              onClick={() => setShowImageModal(true)}
              className="w-full h-80 md:h-full object-cover cursor-zoom-in"
            />
          </div>

          <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              <p className="text-sm text-gray-500 mb-1">
                Category: <span className="text-pink-500 font-semibold">{product.category}</span>
              </p>
              <p className="text-sm mb-1">Semester: {product.semester}</p>
              <p className="text-sm mb-3">Regulation: {product.regulation}</p>
              <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <p className="text-2xl font-bold">₹{product.price}</p>
              {!product.isSold && (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="px-5 py-3 rounded-xl bg-black text-white"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={handleMessageSeller}
                    className="px-5 py-3 rounded-xl bg-blue-600 text-white"
                  >
                    Message Seller
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <section className="max-w-6xl mx-auto mt-16">
          <h2 className="text-xl font-bold mb-6">Recommended for you</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {recommendations.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/product/${item._id}`)}
                className="cursor-pointer rounded-xl border p-3 hover:scale-[1.02] transition"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-40 w-full object-cover rounded-lg mb-2"
                />
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="font-bold">₹{item.price}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* IMAGE MODAL */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src={product.image}
              className="max-w-[95%] max-h-[85%] rounded-lg"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-6 right-6 bg-white p-2 rounded-full"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default ProductDetails;
