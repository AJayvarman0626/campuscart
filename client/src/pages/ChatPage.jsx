import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, ArrowLeft } from "lucide-react";
import { io } from "socket.io-client";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const ENDPOINT = "https://campuscart-server.onrender.com"; // ✅ backend URL

const ChatPage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [isDark, setIsDark] = useState(false);
  const socket = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // 🌗 Theme watcher
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

  // 🧠 Fetch receiver + chat messages
  useEffect(() => {
    if (!user || !user.token) return;

    const fetchChat = async () => {
      try {
        const { data } = await api.get(`/api/chats/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setReceiver(data.receiver);
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Chat load failed", error);
      }
    };
    fetchChat();
  }, [id, user]);

  // ⚡ Socket setup
  useEffect(() => {
    if (!user?._id) return;

    socket.current = io(ENDPOINT);
    socket.current.emit("joinChat", user._id);

    socket.current.on("newMessage", (msg) => {
      if (msg.sender === user._id) return;
      if (msg.sender === id || msg.receiver === id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [id, user]);

  // 🧹 Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✉️ Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const message = {
      sender: user._id,
      receiver: id,
      content: newMsg,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMsg("");

    socket.current.emit("sendMessage", message);

    try {
      await api.post(
        `/api/chats/message`,
        { content: newMsg, receiver: id },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
    } catch (error) {
      console.error("❌ Failed to send message:", error);
    }
  };

  // 👤 Navigate to seller profile
  const handleProfileClick = () => {
    if (receiver?._id) navigate(`/seller/${receiver._id}`);
  };

  // 🕒 Format message time
  const formatTimeIST = (isoString) => {
    try {
      const d = isoString ? new Date(isoString) : new Date();
      return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return "—";
    }
  };

  // 📱 Fix for mobile keyboard view (input stays visible)
  useEffect(() => {
    const handleFocus = () => {
      document.body.classList.add("keyboard-open");
    };
    const handleBlur = () => {
      document.body.classList.remove("keyboard-open");
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener("focus", handleFocus);
      input.addEventListener("blur", handleBlur);
    }

    return () => {
      if (input) {
        input.removeEventListener("focus", handleFocus);
        input.removeEventListener("blur", handleBlur);
      }
    };
  }, []);

  return (
    <main
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isDark ? "bg-[#0f0f0f] text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* 🔝 Fixed Header */}
      <div
        className={`sticky top-[72px] flex items-center justify-between px-4 py-3 border-b z-40 cursor-pointer ${
          isDark
            ? "border-gray-700 bg-[#121212]/95"
            : "border-gray-300 bg-white/95"
        } backdrop-blur-md shadow-sm rounded-3xl mx-3 mt-2`}
        onClick={handleProfileClick}
      >
        <div className="flex items-center gap-3">
          <ArrowLeft
            className="cursor-pointer hover:text-blue-500 transition"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/messages");
            }}
          />
          <img
            src={
              receiver?.profilePic ||
              `https://ui-avatars.com/api/?name=${receiver?.name}&background=random`
            }
            alt="receiver"
            className="w-10 h-10 rounded-full object-cover border"
          />
          <div>
            <p className="font-semibold text-base">{receiver?.name || "User"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {receiver?.stream || "Student"}
            </p>
          </div>
        </div>
      </div>

      {/* 💬 Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-4 mt-2 mb-[90px]"
        style={{ paddingBottom: "6rem" }}
      >
        {messages.map((msg, index) => {
          const isSent = msg.sender === user._id;
          return (
            <div
              key={index}
              className={`flex flex-col ${
                isSent ? "items-end" : "items-start"
              }`}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={`max-w-[80%] sm:max-w-sm px-3 py-2 rounded-2xl shadow ${
                  isSent
                    ? "bg-blue-600 text-white"
                    : isDark
                    ? "bg-gray-800 text-gray-100"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {msg.content}
              </motion.div>
              <span
                className={`text-[10px] mt-1 ${
                  isSent
                    ? "text-gray-300 dark:text-gray-400"
                    : "text-gray-500 dark:text-gray-500"
                } ${isSent ? "text-right" : "text-left"}`}
              >
                {formatTimeIST(msg.createdAt)}
              </span>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* 📝 Floating Input */}
      <form
        onSubmit={sendMessage}
        className={`fixed bottom-0 left-0 w-full flex items-center gap-2 px-3 py-2 sm:py-3 border-t z-50 ${
          isDark
            ? "bg-[#1a1a1a] border-gray-700"
            : "bg-white border-gray-300"
        }`}
        style={{
          height: "auto",
          minHeight: "60px",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          className={`flex-1 bg-transparent outline-none text-sm sm:text-base px-3 py-2 rounded-full ${
            isDark
              ? "text-gray-100 placeholder-gray-400"
              : "text-gray-800 placeholder-gray-500"
          }`}
        />
        <button
          type="submit"
          className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
            isDark
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          <Send size={18} />
        </button>
      </form>
    </main>
  );
};

export default ChatPage;