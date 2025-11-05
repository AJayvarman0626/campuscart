import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false); // 👈 added

  const login = (data) => {
    setUser(data);
    localStorage.setItem("campusUser", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("campusUser");
  };

  // ✅ Load user from localStorage on app start
  useEffect(() => {
    const stored = localStorage.getItem("campusUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      console.log("🧠 Loaded user from localStorage:", parsed);
    } else {
      console.log("⚠️ No stored user found");
    }
    setAuthReady(true); // ✅ ensure ready state
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, authReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);