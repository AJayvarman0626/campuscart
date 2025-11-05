import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import cartLogo from "../assets/cart.png"; // 🛒 make sure the path is correct

const Loader = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 2500); // fade duration
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]"
        >
          {/* 🛒 The Main Cart Icon */}
          <motion.img
            src={cartLogo}
            alt="CampusCart Loader"
            className="w-40 h-40 drop-shadow-2xl"
            initial={{ x: -300, opacity: 0, rotate: -10 }}
            animate={{
              x: 0,
              opacity: 1,
              rotate: [0, 10, -10, 0],
              scale: [0.9, 1.05, 1],
            }}
            transition={{
              duration: 1.8,
              ease: "easeOut",
            }}
          />

          {/* ✨ Soft glow trail effect */}
          <motion.div
            className="absolute w-28 h-28 rounded-full bg-pink-400/30 blur-3xl"
            initial={{ x: -300, opacity: 0 }}
            animate={{
              x: 50,
              opacity: [0.3, 0.6, 0],
              scale: [0.8, 1.4, 1.2],
            }}
            transition={{
              duration: 1.8,
              ease: "easeOut",
            }}
          />

          {/* 🧠 CampusCart Brand Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-6 text-2xl font-bold text-gray-700 tracking-wide"
          >
            CampusCart 🛍️
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
