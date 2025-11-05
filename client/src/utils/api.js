import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000" // 🧑‍💻 Local backend for dev
      : "https://campuscart-service.onrender.com/", // ☁️ Live backend
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // ✅ Prevents CORS cookie issues unless needed
});

export default api;