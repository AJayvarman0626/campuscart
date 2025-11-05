import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { signInWithGoogle } from "../utils/firebase";
import api from "../utils/api";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleRegister = async () => {
    try {
      const userData = await signInWithGoogle();
      // ✅ Add /api prefix here
      const { data } = await api.post("/api/users/google-register", userData);

      login(data);
      toast.success(`Welcome aboard, ${data.name}! 🚀`);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error("You're already registered! Try logging in instead ⚡");
        navigate("/login");
      } else {
        toast.error("Google registration failed 💔");
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0f0f0f] transition-colors duration-500 px-4 sm:px-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="glass-card w-full max-w-md sm:max-w-lg md:max-w-md rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl text-center"
      >
        {/* 🪞 Logo */}
        <motion.img
          src="/nav-icon.png"
          alt="CampusCart Logo"
          className="w-16 sm:w-20 mx-auto mb-4 drop-shadow-md"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        />

        {/* ✨ Heading */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
          Join CampusCart
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-8">
          Create your account today ✨
        </p>

        {/* 🧠 Google Register Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{
            scale: 1.03,
            boxShadow:
              "0 0 20px rgba(156,163,175,0.3), 0 0 10px rgba(255,255,255,0.05)",
          }}
          onClick={handleGoogleRegister}
          className="w-full bg-white dark:bg-[#222] border border-gray-300 dark:border-gray-700 
                     text-gray-900 dark:text-gray-100 font-semibold py-3 rounded-xl 
                     flex items-center justify-center gap-3 text-base
                     hover:bg-gray-100 dark:hover:bg-[#333] transition-all duration-300"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-6 h-6"
          />
          Sign up with Google
        </motion.button>

        {/* 🧾 Login Redirect */}
        <p className="mt-8 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          Already have an account?{" "}
          <span
            className="text-gray-900 dark:text-white font-medium hover:underline cursor-pointer transition"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </motion.div>

      {/* ⚡ Footer Credit */}
      <p className="mt-10 text-gray-500 dark:text-gray-400 text-xs sm:text-sm text-center">
        © {new Date().getFullYear()} CampusCart — Built by Sigma σ Coders
      </p>
    </div>
  );
};

export default Register;