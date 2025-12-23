import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

/* 🔍 Search Icon */
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

/* 🔲 Skeleton Card */
const ProductSkeleton = ({ isDark }) => (
  <div
    className={`rounded-xl border overflow-hidden w-[92%] sm:w-[85%] md:w-[80%] lg:w-[75%]
    ${isDark ? "border-gray-700 bg-[#1d1d1d]" : "border-gray-200 bg-white"}`}
  >
    <div className="w-full h-32 sm:h-40 md:h-48 animate-pulse bg-gray-300/60 dark:bg-gray-700" />
    <div className="p-3 space-y-2">
      <div className="h-4 w-3/4 mx-auto rounded bg-gray-300/60 dark:bg-gray-700 animate-pulse" />
      <div className="h-3 w-full rounded bg-gray-300/60 dark:bg-gray-700 animate-pulse" />
      <div className="h-3 w-5/6 mx-auto rounded bg-gray-300/60 dark:bg-gray-700 animate-pulse" />
      <div className="h-4 w-20 mx-auto rounded bg-gray-300/60 dark:bg-gray-700 animate-pulse" />
      <div className="h-8 w-24 mx-auto rounded bg-gray-300/60 dark:bg-gray-700 animate-pulse" />
    </div>
  </div>
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

  /* 🧠 Fetch Products */
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
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, keyword]);

  /* 🔍 Search */
  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/explore?keyword=${encodeURIComponent(query.trim())}`);
  };

  /* 🔐 Product Click */
  const handleProductClick = (id) => {
    if (!user) navigate("/login");
    else navigate(`/product/${id}`);
  };

  /* 💤 Empty State */
  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
        {keyword || category
          ? "No products found for your search 🔍"
          : "No products listed yet. Be the first to post!"}
      </p>
      {!user && (
        <button
          onClick={() => navigate("/register")}
          className={`mt-4 px-5 py-2 rounded-lg font-semibold ${
            isDark ? "bg-gray-100 text-black" : "bg-gray-900 text-white"
          }`}
        >
          Register & List Your Item
        </button>
      )}
    </div>
  );

  return (
    <main
      className={`min-h-screen pb-20 transition-colors ${
        isDark ? "bg-[#171717] text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      {/* 🔍 Sticky Search */}
      <div
        className={`fixed top-0 left-0 w-full z-40 px-4 py-3 backdrop-blur-md border-b
        ${isDark ? "bg-[#171717]/80 border-gray-800" : "bg-white/80 border-gray-200"}`}
      >
        <form
          onSubmit={handleSearch}
          className={`flex items-center gap-2 max-w-3xl mx-auto rounded-full px-4 py-2 border
          ${isDark ? "bg-white/10 border-gray-700" : "bg-white border-gray-200"}`}
        >
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, notes, gadgets..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button
            className={`px-4 py-1.5 rounded-full text-sm ${
              isDark ? "bg-gray-100 text-black" : "bg-gray-900 text-white"
            }`}
          >
            Go
          </button>
        </form>
      </div>

      {/* 🏷️ Header */}
      <div className="pt-24 text-center mb-8">
        <h1 className="text-2xl font-bold">
          {category
            ? `Explore ${category}`
            : keyword
            ? `Results for “${keyword}”`
            : "Explore All Products"}
        </h1>
        <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Discover used items from your campus.
        </p>
      </div>

      {/* 🧱 Grid */}
      <section className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} isDark={isDark} />
            ))}
          </div>
        ) : products.length === 0 ? (
          renderEmpty()
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center">
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => handleProductClick(product._id)}
                className={`cursor-pointer rounded-xl border overflow-hidden w-[92%] sm:w-[85%] md:w-[80%] lg:w-[75%]
                ${isDark ? "border-gray-700 bg-[#1d1d1d]" : "border-gray-200 bg-white"}`}
              >
                <div className="h-32 sm:h-40 md:h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition"
                  />
                </div>
                <div className="p-3 text-center">
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="font-bold mt-2">₹{product.price}</p>
                  {product.isSold && (
                    <p className="text-xs text-red-500 mt-1">🔒 Sold Out</p>
                  )}
                  <button className="mt-3 px-4 py-1.5 text-sm rounded bg-gray-900 text-white">
                    View
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Explore;
