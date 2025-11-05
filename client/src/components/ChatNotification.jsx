import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

const ChatNotification = ({ type = "success", message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const Icon = type === "success" ? CheckCircle2 : XCircle;
  const color =
    type === "success"
      ? "from-green-400 to-emerald-500"
      : "from-red-400 to-pink-500";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`fixed bottom-6 right-6 z-[9999] bg-gradient-to-r ${color}
        text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 backdrop-blur-lg`}
      >
        <Icon size={20} className="drop-shadow-md" />
        <p className="font-medium text-sm">{message}</p>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatNotification;