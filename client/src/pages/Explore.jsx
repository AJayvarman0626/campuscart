import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const SearchIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const Explore = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [query, setQuery] = useState("");

  const category = searchParams.get("category");
  const keyword = searchParams.get("keyword");

  // 🌗 Dark/light mode detection
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

  // 🧠 Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParam = category
          ? `?keyword=${encodeURIComponent(category)}`
          : keyword
          ? `?keyword=${encodeURIComponent(keyword)}`
          : "";
        const { data } = await api.get(`/api/products${queryParam}`);
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (err) {
        console.error("Failed to load products", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, keyword]);

  // 🔍 Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const cleaned = query.trim();
    if (!cleaned) return;
    navigate(`/explore?keyword=${encodeURIComponent(cleaned)}`);
  };

  // 🧭 Handle product click (with login guard)
  const handleProductClick = (productId) => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(`/product/${productId}`);
    }
  };

  // 💤 Empty state
  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <p
        className={`text-base sm:text-lg ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {keyword || category
          ? "No products found for your search 🔍"
          : "No products listed yet. Be the first to post!"}
      </p>
      {!user && (
        <button
          onClick={() => navigate("/register")}
          className={`mt-4 px-5 py-2 rounded-lg font-semibold transition-all ${
            isDark
              ? "bg-gray-100 text-black hover:bg-gray-200"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          Register & List Your Item
        </button>
      )}
    </div>
  );

  return (
    <main
      className={`min-h-screen transition-colors duration-500 pb-20 ${
        isDark ? "bg-[#171717] text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      {/* 🔍 Sticky Search Bar */}
      <div
        className={`fixed top-0 left-0 w-full z-40 px-4 sm:px-6 py-3 backdrop-blur-md border-b ${
          isDark
            ? "bg-[#171717]/80 border-gray-800"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <form
          onSubmit={handleSearch}
          className={`flex items-center gap-2 w-full max-w-3xl mx-auto ${
            isDark ? "bg-white/10" : "bg-white/90"
          } backdrop-blur-md border ${
            isDark ? "border-gray-700" : "border-gray-200"
          } rounded-full px-4 py-2 shadow-sm sm:shadow-md transition-all`}
        >
          <div
            className={`flex items-center shrink-0 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            <SearchIcon />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, notes, gadgets, lab coats..."
            className={`flex-1 bg-transparent outline-none text-sm sm:text-base ${
              isDark
                ? "text-gray-100 placeholder:text-gray-400"
                : "text-gray-800 placeholder:text-gray-500"
            }`}
          />

          <button
            type="submit"
            className={`ml-2 rounded-full px-4 py-1.5 text-sm font-medium ${
              isDark ? "bg-gray-100 text-black" : "bg-gray-900 text-white"
            } hover:opacity-95 transition-all`}
          >
            Go
          </button>
        </form>
      </div>

      {/* 🏷️ Header */}
      <div className="pt-24 text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {category
            ? `Explore ${category}`
            : keyword
            ? `Results for “${keyword}”`
            : "Explore All Products"}
        </h1>
        <p
          className={`mt-1 text-sm sm:text-base ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Discover used books, notes, and gadgets from your campus.
        </p>
      </div>

      {/* 🌀 Loader */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
        </div>
      )}

      {/* 🧱 Product Grid */}
      {!loading && (
        <section className="w-full max-w-7xl mx-auto mb-10 px-4 sm:px-6">
          {products.length === 0 ? (
            renderEmpty()
          ) : (
            <div
              className="
                grid
                grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
                gap-3 sm:gap-4
                place-items-center
              "
            >
              {products.map((product, i) => (
                <motion.div
                  key={product._id || i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => handleProductClick(product._id)} // ✅ added login check here
                  className={`rounded-xl border overflow-hidden ${
                    isDark
                      ? "border-gray-700 bg-[#1d1d1d]"
                      : "border-gray-200 bg-white"
                  } shadow-md hover:shadow-lg transition-all cursor-pointer w-[92%] sm:w-[85%] md:w-[80%] lg:w-[75%]`}
                >
                  {/* 🖼️ Product Image */}
                  <div className="w-full h-32 sm:h-40 md:h-48 overflow-hidden">
                    <img
                      src={
                        product.image ||
                        "https://cdn-icons-png.flaticon.com/512/679/679720.png"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>

                  {/* 📄 Product Info */}
                  <div className="p-3 text-center">
                    <h3 className="text-sm sm:text-base font-semibold truncate">
                      {product.name}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm mt-1 line-clamp-2 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {product.description}
                    </p>

                    <div className="mt-2 flex flex-col items-center">
                      <p
                        className={`text-sm sm:text-base font-bold ${
                          isDark ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        ₹{product.price?.toFixed(2) || "N/A"}
                      </p>
                      {product.isSold && (
                        <p className="mt-1 text-xs sm:text-sm text-red-500 font-semibold">
                          🔒 Sold Out
                        </p>
                      )}
                    </div>

                    <button
                      className={`mt-3 text-xs sm:text-sm px-4 py-1.5 rounded-lg font-medium transition-all ${
                        isDark
                          ? "bg-gray-100 text-black hover:bg-gray-200"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      View
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default Explore;