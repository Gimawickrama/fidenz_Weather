import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

function ThemeToggle() {
  // read saved theme once, so we don't flash a wrong one
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // body class drives the whole design system via css variables
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);

    // remember the choice for next visit
    localStorage.setItem(
      "theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  return (
    <button
      className="theme-toggle"
      onClick={() => setDarkMode((prev) => !prev)}
      aria-label={
        darkMode
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={darkMode ? "Light mode" : "Dark mode"}
    >
      <span
        className={`theme-toggle-slider ${
          darkMode ? "is-dark" : ""
        }`}
      >
        {darkMode ? (
          <Moon size={13} />
        ) : (
          <Sun size={13} />
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;