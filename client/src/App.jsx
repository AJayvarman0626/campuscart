import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";

// 🏠 Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import SellerDashboard from "./pages/SellerDashboard";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import SellerProfile from "./pages/SellerProfile";

// 💬 Chat Pages
import ChatList from "./pages/ChatList";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <>
      {/* 🌀 Loader for smooth entrance animation */}
      <Loader />

      <BrowserRouter>
        <Navbar />
        <Toaster position="top-right" reverseOrder={false} />

        <Routes>
          {/* 🏠 Main Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />

          {/* 👤 Seller Profile */}
          <Route path="/seller/:id" element={<SellerProfile />} />

          {/* 💬 Chat System */}
          <Route path="/messages" element={<ChatList />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="/chat/new" element={<ChatPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;