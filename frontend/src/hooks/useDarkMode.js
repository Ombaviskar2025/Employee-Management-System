/**
 * useDarkMode.js
 * Custom hook for dark mode toggle with localStorage persistence.
 * Syncs with system preference on first visit.
 */

import { useState, useEffect } from "react";

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem("ems_dark_mode");
    if (stored !== null) return stored === "true";
    // Fall back to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
    localStorage.setItem("ems_dark_mode", isDark.toString());
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle };
};

export default useDarkMode;
