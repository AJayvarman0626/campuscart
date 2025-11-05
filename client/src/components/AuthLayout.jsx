import React from "react";
import { motion } from "framer-motion";

const AuthLayout = ({ children, title, subtitle, icon }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-purple-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-10 rounded-3xl w-[24rem] text-center shadow-xl border border-pink-100 backdrop-blur-md"
      >
        {icon && (
          <motion.img
            src={icon}
            alt="auth icon"
            className="w-16 mx-auto mb-4 drop-shadow-md"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          />
        )}

        {title && (
          <h2 className="text-3xl font-extrabold text-pink-600 mb-2">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-gray-500 mb-6 text-sm">{subtitle}</p>
        )}

        {/* 👇 The page content (form, buttons, etc.) */}
        {children}
      </motion.div>
    </div>
  );
};

export default AuthLayout;
