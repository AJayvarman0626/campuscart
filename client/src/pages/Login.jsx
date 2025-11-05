import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { signInWithGoogle } from "../utils/firebase";
import api from "../utils/api";
import cartLogo from "../assets/cart.png";
import whiteLogo from "../assets/white.png";
import { Moon, Sun } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  // 🌗 Detect & sync dark mode (same as Home)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const darkMode = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  const handleGoogleLogin = async () => {
    try {
      const userData = await signInWithGoogle();
      const { data } = await api.post("/api/users/google-login", userData);
      login(data);
      toast.success(`Welcome back, ${data.name}! 🤝`);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 404) {
        toast("No account found — creating one for you ⚙️");
        const registerRes = await api.post("/api/users/google-register", userData);
        login(registerRes.data);
        toast.success(`Welcome, ${registerRes.data.name}! 👋`);
        navigate("/dashboard");
      } else {
        console.error("Google login failed:", err);
        toast.error("Google Login failed 💔");
      }
    }
  };

  return (
    <main
      className={`min-h-[calc(100dvh-60px)] flex flex-col items-center justify-center transition-colors duration-300 px-4 sm:px-6 md:px-8 pb-[70px] ${
        isDark ? "bg-[#171717] text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className={`w-full max-w-md rounded-3xl p-8 sm:p-10 shadow-2xl border 
          ${isDark ? "border-gray-800 bg-[#1a1a1a]/90" : "border-gray-200 bg-white/90"} 
          backdrop-blur-xl text-center flex flex-col items-center justify-center`}
      >
        {/* 🪞 Logo Flip */}
        <motion.div
          key={isDark ? "darkLogo" : "lightLogo"}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-16 sm:w-20 mx-auto mb-4"
        >
          <img
            src={isDark ? whiteLogo : cartLogo}
            alt="CampusCart Logo"
            className="w-16 sm:w-20 drop-shadow-md object-contain mx-auto"
          />
        </motion.div>

        {/* ✨ Heading */}
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">Welcome Back</h2>
        <p
          className={`text-base sm:text-lg mb-8 ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Log in to continue your journey 🚀
        </p>

        {/* 🧠 Google Login Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{
            scale: 1.03,
            boxShadow: isDark
              ? "0 0 15px rgba(255,255,255,0.1)"
              : "0 0 15px rgba(0,0,0,0.1)",
          }}
          onClick={handleGoogleLogin}
          className={`w-full border font-semibold py-3 rounded-xl flex items-center justify-center gap-3 text-base transition-all duration-300 
            ${
              isDark
                ? "bg-[#222] border-gray-700 text-gray-100 hover:bg-[#333]"
                : "bg-white border-gray-300 text-gray-900 hover:bg-gray-100"
            }`}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-6 h-6"
          />
          Continue with Google
        </motion.button>

        {/* 🧾 Register Link */}
        <p
          className={`mt-8 text-sm sm:text-base ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Don’t have an account?{" "}
          <span
            className={`font-medium hover:underline cursor-pointer ${
              isDark ? "text-white" : "text-gray-900"
            }`}
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </motion.div>

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

      {/* ⚡ Footer */}
      <p
        className={`mt-10 text-xs sm:text-sm text-center ${
          isDark ? "text-gray-500" : "text-gray-600"
        }`}
      >
        © {new Date().getFullYear()} CampusCart — Built by Sigma σ Coders
      </p>
    </main>
  );
};

export default Login;