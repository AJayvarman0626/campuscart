import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import cartLogo from "../assets/cart.png";
import whiteLogo from "../assets/white.png";
import { Moon, Sun } from "lucide-react";

// ✅ Categories
const categories = [
  { id: 1, name: "Books", icon: "📚", color: "from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-600" },
  { id: 2, name: "Notes", icon: "🧾", color: "from-gray-200 to-gray-400 dark:from-gray-600 dark:to-gray-500" },
  { id: 3, name: "Gadgets", icon: "⚙️", color: "from-gray-300 to-gray-500 dark:from-gray-500 dark:to-gray-400" },
  { id: 4, name: "Lab Coat", icon: "🥼", color: "from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-600" },
];

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

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [query, setQuery] = useState("");

  // 🌗 Detect & apply theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const darkMode = saved === "dark" || (!saved && prefersDark);
    setIsDark(darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const cleaned = query.trim();
    if (!cleaned) return;
    navigate(`/explore?keyword=${encodeURIComponent(cleaned)}`);
  };

  const goCategory = (name) => navigate(`/explore?category=${encodeURIComponent(name)}`);

  return (
    <main
      className={`pt-12 pb-28 min-h-screen flex flex-col items-center transition-colors duration-300 px-4 sm:px-6 ${
        isDark ? "bg-[#171717] text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      {/* 🌟 Hero */}
      <motion.section
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 px-2 flex flex-col items-center justify-center"
      >
        {/* 📱 Mobile (Logo Visible) */}
        <div className="sm:hidden flex flex-col items-center justify-center mb-4">
          <h2 className="text-3xl font-extrabold mb-1">Welcome to</h2>
          <div className="flex items-center gap-2 relative">
            <motion.div
              key={isDark ? "darkLogo" : "lightLogo"}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-14 h-14"
            >
              <img
                src={isDark ? whiteLogo : cartLogo}
                alt="CampusCart Logo"
                className="w-14 h-14 drop-shadow-md object-contain"
              />
            </motion.div>
            <h1 className="text-3xl font-black">CampusCart</h1>
          </div>
        </div>

        {/* 💻 Desktop (Text Only - No Logo) */}
        <div className="hidden sm:block mb-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight flex items-center justify-center gap-3">
            Welcome to <span className="font-black">CampusCart</span>
          </h1>
        </div>

        {/* 🔍 Search bar */}
        <form
          onSubmit={handleSearch}
          className={`flex items-center gap-2 w-full max-w-3xl mt-2 mb-4 ${
            isDark ? "bg-white/10" : "bg-white/90"
          } backdrop-blur-md border ${
            isDark ? "border-gray-700" : "border-gray-200"
          } rounded-full px-4 py-2 shadow-sm sm:shadow-md transition-all`}
          role="search"
        >
          <div className={`flex items-center shrink-0 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
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

        <p
          className={`mt-1 text-sm sm:text-base max-w-xl mx-auto ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Buy, sell or share your campus essentials — quick, local, and simple.
        </p>
      </motion.section>

      {/* 🧱 Categories */}
      <section className="w-full max-w-6xl px-4 md:px-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.article
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => goCategory(cat.name)}
              className={`relative group cursor-pointer rounded-2xl overflow-hidden border ${
                isDark ? "border-gray-700" : "border-gray-200"
              } shadow-sm hover:shadow-lg transition-all bg-gradient-to-br ${cat.color}`}
            >
              <div className="p-8 md:p-10 h-full flex flex-col items-start justify-center gap-4">
                <div className="text-4xl md:text-5xl">{cat.icon}</div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold group-hover:scale-105 transition-transform">
                    {cat.name}
                  </h3>
                  <p className="text-sm opacity-90 mt-1">
                    Browse listings for {cat.name.toLowerCase()} in your campus.
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* 🌗 Theme Toggle */}
      <motion.button
        onClick={toggleTheme}
        whileTap={{ scale: 0.9 }}
        className={`fixed z-50 p-3 rounded-full shadow-lg border transition-all ${
          isDark
            ? "bg-gray-100 text-black hover:bg-gray-200"
            : "bg-gray-900 text-white hover:bg-gray-800"
        } bottom-20 right-5 sm:bottom-8 sm:right-8`}
      >
        {isDark ? <Sun size={22} /> : <Moon size={22} />}
      </motion.button>

      {/* 🦶 Footer */}
      <footer
        className={`mt-14 mb-6 text-xs sm:text-sm ${
          isDark ? "text-gray-500" : "text-gray-600"
        }`}
      >
        © {new Date().getFullYear()} CampusCart — Your Campus Marketplace
      </footer>
    </main>
  );
};

export default Home;