// ✅ Core Firebase imports
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2kVTQkUJtnx8wEGorNz3P9Zo9gS7YyZ4",
  authDomain: "campuscart-f56f9.firebaseapp.com",
  projectId: "campuscart-f56f9",
  storageBucket: "campuscart-f56f9.firebasestorage.app",
  messagingSenderId: "291350027782",
  appId: "1:291350027782:web:fb5decd1eec6bf5361ed87",
  measurementId: "G-SE9CZG9Q59",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Auth setup
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ✅ Reusable function for Google Sign-in
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // 🎉 Extract only what you need
    return {
      name: user.displayName,
      email: user.email,
      profilePic: user.photoURL,
    };
  } catch (error) {
    console.error("❌ Google Sign-In Error:", error);
    throw error;
  }
};
