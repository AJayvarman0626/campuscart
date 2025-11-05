// src/themeInit.js
const THEME_KEY = "theme";

// Force-disable browser color scheme detection
if (window.matchMedia) {
  try {
    const light = window.matchMedia("(prefers-color-scheme: light)");
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    light.removeEventListener?.("change", () => {});
    dark.removeEventListener?.("change", () => {});
  } catch (e) {
    // ignore if unsupported
  }
}

// Always enforce app-controlled theme
(function applyTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  } catch {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }
})();