import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";

const Dashboard = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [profileData, setProfileData] = useState({
    name: "",
    stream: "",
    year: "",
    bio: "",
    profilePic: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // 🌙 Live theme watcher
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

  // 🧩 Load Profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProfileData(data);
      } catch (err) {
        console.error("❌ Failed to load profile:", err);
        toast.error("Failed to load profile ❌");
      }
    };
    if (user) fetchUser();
  }, [user]);

  // 📸 Upload Profile Pic
  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const { data } = await api.post("/api/users/upload", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setPreview(data.imageUrl);
      toast.success("Profile picture uploaded ✅");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed 💔");
    }
  };

  // 📚 Stream Short Map
  const streamShortMap = {
    "Computer Science and Engineering": "CSE",
    "Artificial Intelligence and Data Science": "AIDS",
    "Information Technology": "IT",
    "Electronics and Communication Engineering": "ECE",
    "Electrical and Electronics Engineering": "EEE",
    "Mechanical Engineering": "MECH",
    "Civil Engineering": "CIVIL",
  };

  // 💾 Save Profile
  const handleSave = async () => {
    if (!profileData.name) {
      toast.error("Please enter your name ⚠️");
      return;
    }

    const shortStream =
      streamShortMap[profileData.stream] || profileData.stream;

    try {
      const { data } = await api.put(
        "/api/users/profile",
        {
          ...profileData,
          stream: shortStream,
          profilePic: preview || profileData.profilePic,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      login(data);
      setPreview(null);
      setIsEditing(false);
      toast.success("Profile updated successfully ✅");
    } catch (error) {
      console.error(error);
      toast.error("Update failed 💔");
    }
  };

  const handleLogout = () => setLogoutConfirm(true);
  const confirmLogout = () => {
    logout();
    toast.success("Logged out 👋");
    navigate("/login");
  };

  const handleSeller = () => navigate("/seller-dashboard");

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-28 sm:pb-16 transition-colors duration-500 ${
        isDark ? "bg-[#0f0f0f] text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`rounded-3xl p-8 w-full max-w-lg text-center border shadow-xl transition-colors duration-300 ${
          isDark
            ? "border-gray-800 bg-[#1a1a1a]/90"
            : "border-gray-200 bg-white/80"
        }`}
      >
        {/* 👤 Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <motion.img
              src={
                preview ||
                profileData.profilePic ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="profile"
              className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-300 dark:border-gray-700 shadow-md transition-transform group-hover:scale-105"
              whileHover={{ scale: 1.05 }}
            />

            {isEditing && (
              <>
                <motion.button
                  onClick={() => fileInputRef.current.click()}
                  whileHover={{ scale: 1.1 }}
                  className={`absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center border-2 shadow-md ${
                    isDark
                      ? "bg-gray-100 text-black border-gray-600"
                      : "bg-gray-900 text-white border-gray-300"
                  }`}
                  title="Change Photo"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </motion.button>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePicChange}
                  className="hidden"
                />
              </>
            )}
          </div>
        </div>

        {/* 👇 Profile Info */}
        {!isEditing ? (
          <div className="text-left space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-center">
                {profileData.name || "Your Name"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {profileData.stream || "Stream not set"} •{" "}
                {profileData.year ? `${profileData.year} Year` : "Year N/A"}
              </p>
            </div>
            <div className="mt-4">
              <p className="text-gray-700 dark:text-gray-300">
                {profileData.bio || "No bio added yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            {/* 🧑 Name */}
            <div>
              <label
                className={`block font-semibold mb-1 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className={`w-full rounded-lg px-3 py-2 outline-none ${
                  isDark
                    ? "bg-gray-800 border border-gray-700 text-gray-100"
                    : "bg-gray-100 border border-gray-300 text-gray-800"
                }`}
              />
            </div>

            {/* 📚 Stream Dropdown */}
            <div>
              <label
                className={`block font-semibold mb-1 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Stream
              </label>
              <select
                value={profileData.stream}
                onChange={(e) =>
                  setProfileData({ ...profileData, stream: e.target.value })
                }
                className={`w-full rounded-lg px-3 py-2 outline-none ${
                  isDark
                    ? "bg-gray-800 border border-gray-700 text-gray-100"
                    : "bg-gray-100 border border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Select Stream</option>
                <option value="Computer Science and Engineering">
                  Computer Science and Engineering
                </option>
                <option value="Artificial Intelligence and Data Science">
                  Artificial Intelligence and Data Science
                </option>
                <option value="Information Technology">
                  Information Technology
                </option>
                <option value="Electronics and Communication Engineering">
                  Electronics and Communication Engineering
                </option>
                <option value="Electrical and Electronics Engineering">
                  Electrical and Electronics Engineering
                </option>
                <option value="Mechanical Engineering">
                  Mechanical Engineering
                </option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            {/* 📅 Year */}
            <div>
              <label
                className={`block font-semibold mb-1 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Year
              </label>
              <select
                value={profileData.year}
                onChange={(e) =>
                  setProfileData({ ...profileData, year: e.target.value })
                }
                className={`w-full rounded-lg px-3 py-2 outline-none ${
                  isDark
                    ? "bg-gray-800 border border-gray-700 text-gray-100"
                    : "bg-gray-100 border border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">Final Year</option>
              </select>
            </div>

            {/* 🧠 Bio */}
            <div>
              <label
                className={`block font-semibold mb-1 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) =>
                  setProfileData({ ...profileData, bio: e.target.value })
                }
                placeholder="Tell us something about yourself..."
                rows={3}
                className={`w-full rounded-lg px-3 py-2 resize-none outline-none ${
                  isDark
                    ? "bg-gray-800 border border-gray-700 text-gray-100"
                    : "bg-gray-100 border border-gray-300 text-gray-800"
                }`}
              />
            </div>
          </div>
        )}

        {/* ✏️ Buttons */}
        <div className="flex flex-col md:flex-row gap-3 mt-6">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-black py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
            >
              💾 Save Changes
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-black py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
            >
              ✏️ Edit Profile
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex-1 border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            Logout
          </button>
        </div>

        {/* 🛍️ Become a Seller */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSeller}
          className="mt-6 w-full bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-200 dark:to-gray-400 text-white dark:text-black py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
        >
          🛍️ Become a Seller
        </motion.button>

        {/* 🚪 Logout Modal */}
        {logoutConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-6 rounded-xl shadow-2xl border text-center ${
                isDark
                  ? "bg-[#1a1a1a] border-gray-700 text-gray-200"
                  : "bg-white border-gray-300 text-gray-800"
              }`}
            >
              <p className="mb-4 text-lg font-medium">
                Are you sure you want to logout?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmLogout}
                  className="bg-gray-900 dark:bg-gray-100 text-white dark:text-black px-5 py-2 rounded-lg font-semibold"
                >
                  Yes
                </button>
                <button
                  onClick={() => setLogoutConfirm(false)}
                  className="border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;