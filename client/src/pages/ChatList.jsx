// client/src/pages/ChatList.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MoreVertical, Trash2 } from "lucide-react";
import { io } from "socket.io-client";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const ENDPOINT = "https://campuscart-server.onrender.com";
const LAST_SEEN_KEY = "campuscart_lastSeenMessages";

const ChatList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [unread, setUnread] = useState({});
  const [menuOpen, setMenuOpen] = useState(null); // holds otherUserId when open
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );
  const socket = useRef(null);
  const menuRef = useRef(null);

  // theme observer
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // click outside to close menu
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // load/save last seen helpers
  const loadLastSeen = () =>
    JSON.parse(localStorage.getItem(LAST_SEEN_KEY) || "{}");
  const saveLastSeen = (map) =>
    localStorage.setItem(LAST_SEEN_KEY, JSON.stringify(map));

  // fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/api/chats", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setChats(data || []);

        const lastSeen = loadLastSeen();
        const unreadMap = {};
        (data || []).forEach((chat) => {
          const other = chat.users?.find((u) => u._id !== user._id);
          if (!other) return;
          const lastTime = new Date(
            chat.lastMessage?.createdAt || chat.updatedAt
          ).getTime();
          const seenTime = lastSeen[other._id] || 0;
          if (lastTime > seenTime) unreadMap[other._id] = true;
        });
        setUnread(unreadMap);
      } catch (err) {
        console.error("❌ Failed to load chats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [user]);

  // socket setup
  useEffect(() => {
    if (!user?._id) return;
    socket.current = io(ENDPOINT);
    socket.current.emit("joinChat", user._id);

    socket.current.on("newMessage", (msg) => {
      if (msg.sender === user._id) return;
      setUnread((prev) => ({ ...prev, [msg.sender]: true }));

      setChats((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((c) =>
          c.users.some((u) => u._id === msg.sender)
        );
        if (idx >= 0) {
          updated[idx].lastMessage = msg;
          updated[idx].updatedAt = msg.createdAt || new Date().toISOString();
          const [recent] = updated.splice(idx, 1);
          updated.unshift(recent);
        } else {
          updated.unshift({
            users: [
              { _id: msg.sender, name: msg.senderName, profilePic: msg.senderPic },
              { _id: user._id },
            ],
            lastMessage: msg,
            updatedAt: msg.createdAt || new Date().toISOString(),
          });
        }
        return [...updated];
      });
    });

    return () => socket.current.disconnect();
  }, [user]);

  // search users (protected)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!user?.token) {
      // optional: redirect to login or show toast
      // toast.error("Please log in to search users");
      navigate("/login");
      return;
    }

    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const { data } = await api.get(`/api/users?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Search failed:", err);
      setSearchResults([]);
    }
  };

  // start / get chat -> navigate
  const handleStartChat = async (otherUserId) => {
    if (!user?.token) return navigate("/login");
    try {
      const { data } = await api.post(
        "/api/chats",
        { userId: otherUserId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const seenMap = loadLastSeen();
      seenMap[otherUserId] = Date.now();
      saveLastSeen(seenMap);

      setUnread((prev) => {
        const updated = { ...prev };
        delete updated[otherUserId];
        return updated;
      });

      navigate(`/chat/${otherUserId}`);
    } catch (err) {
      console.error("❌ Failed to access chat:", err);
    }
  };

  // delete chat -> IMPORTANT: server expects otherUserId (not chat._id)
  const handleDeleteChat = async (otherUserId) => {
    if (!user?.token) return navigate("/login");
    try {
      await api.delete(`/api/chats/${otherUserId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // remove from UI and unread map and lastSeen
      setChats((prev) =>
        prev.filter((c) => {
          const other = c.users?.find((u) => u._id !== user._id);
          return other?._id !== otherUserId;
        })
      );

      setUnread((prev) => {
        const copy = { ...prev };
        delete copy[otherUserId];
        return copy;
      });

      const seen = loadLastSeen();
      delete seen[otherUserId];
      saveLastSeen(seen);

      setMenuOpen(null);
      // toast.success("Chat cleared");
    } catch (err) {
      console.error("❌ Failed to delete chat:", err);
      // toast.error("Failed to delete chat");
    }
  };

  if (loading)
    return (
      <div className="pt-24 text-center text-gray-500 dark:text-gray-400">
        Loading chats...
      </div>
    );

  return (
    <main
      className={`pt-20 pb-24 min-h-screen px-4 transition-colors duration-500 ${
        isDark ? "bg-[#1e1e1e] text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Top fixed search */}
      <div
        className={`fixed top-14 left-0 w-full z-40 px-4 pb-3 ${
          isDark ? "bg-[#1e1e1e]" : "bg-gray-50"
        } border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
      >
        <h2 className="text-lg font-semibold mb-2">Messages 💬</h2>
        <form
          onSubmit={handleSearch}
          className={`flex items-center gap-2 w-full ${
            isDark ? "bg-[#2a2a2a]" : "bg-white"
          } border ${isDark ? "border-gray-700" : "border-gray-200"} rounded-full px-4 py-2 shadow-sm`}
        >
          <Search size={18} className={isDark ? "text-gray-300" : "text-gray-600"} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users to chat..."
            className={`flex-1 bg-transparent outline-none text-sm sm:text-base ${
              isDark ? "text-gray-100 placeholder:text-gray-400" : "text-gray-800 placeholder:text-gray-500"
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

      {/* List area */}
      <div className="mt-28 flex flex-col gap-3 pb-24 relative z-10">
        {isSearching ? (
          searchResults.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-10">No users found.</p>
          ) : (
            searchResults.map((u) => (
              <motion.div
                key={u._id}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleStartChat(u._id)}
                className={`flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer border ${
                  isDark ? "border-gray-700 bg-[#2a2a2a] hover:bg-[#333]" : "border-gray-200 bg-white hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.profilePic || `https://ui-avatars.com/api/?name=${u.name}&background=random`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tap to start chat 💬</p>
                  </div>
                </div>
              </motion.div>
            ))
          )
        ) : chats.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">No messages yet 😶</p>
        ) : (
          chats.map((chat) => {
            const other = chat.users?.find((u) => u._id !== user._id);
            if (!other) return null;
            const lastMsg = chat.lastMessage?.content || "No messages yet";
            const hasNew = !!unread[other._id];

            return (
              <motion.div
                key={chat._id}
                whileHover={{ scale: 1.01 }}
                className={`flex items-center justify-between gap-3 p-3 rounded-lg border relative ${
                  isDark ? "border-gray-700 bg-[#2a2a2a] hover:bg-[#333]" : "border-gray-200 bg-white hover:bg-gray-100"
                }`}
              >
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => handleStartChat(other._id)}
                >
                  <img
                    src={other.profilePic || `https://ui-avatars.com/api/?name=${other.name}&background=random`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      {other.name}
                      {hasNew && (
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-[2px] rounded-full">NEW</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{lastMsg}</p>
                  </div>
                </div>

                {/* menu */}
                <div className="relative" ref={menuRef}>
                  <MoreVertical
                    size={18}
                    className="cursor-pointer text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen((prev) => (prev === other._id ? null : other._id));
                    }}
                  />

                  <AnimatePresence>
                    {menuOpen === other._id && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.12 }}
                        className={`absolute right-0 top-7 w-40 p-2 rounded-lg shadow-lg z-[999] ${isDark ? "bg-[#1b1b1b] border border-gray-700" : "bg-white border border-gray-200"}`}
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <button
                          className="flex items-center gap-2 w-full px-2 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md"
                          onClick={() => handleDeleteChat(other._id)}
                        >
                          <Trash2 size={14} /> Delete Chat
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </main>
  );
};

export default ChatList;