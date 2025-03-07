import React, { createContext, useContext, useState, useEffect } from "react";

// Create a context for the theme
export const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Tailwind-friendly theme classes
  const themeClasses = {
    dark: {
      // Add name property
      name: "dark",

      // Background colors
      background: "bg-[#1C1C1F]",
      sidebar: "bg-[#2C2C30]",
      cardBackground: "bg-[#2C2C30]",
      card: "bg-[#2C2C30]", // Added for compatibility

      // Text colors
      text: "text-white",
      mutedText: "text-gray-400",

      // Border colors
      borderColor: "border-gray-800",
      divider: "bg-gray-800",

      

      // Icon colors
      iconColor: "text-gray-400",

      // Input fields
      input: "bg-gray-700", // Added for compatibility

      // Hover and interactive states
      hoverBackground: "hover:bg-gray-700",

       // Navigation and interaction states
    navItem: 'hover:bg-gray-700',
    activeNavItem: 'bg-white', // Change from 'bg-gray-800' to 'bg-white'
    navItemText: 'text-gray-300',
    activeNavItemText: 'text-black', // Add this new property

      // Theme-specific styles
      themeToggle: {
        base: "px-1 py-1 rounded-md transition-colors",
        dark: "text-white hover:bg-gray-600",
        light: "hover:bg-gray-300",
      },




      
    },
    light: {
      // Add name property
      name: "light",

      // Background colors
      background: "bg-white",
      sidebar: "bg-gray-100",
      cardBackground: "bg-white",
      card: "bg-white", // Added for compatibility

      // Text colors
      text: "text-gray-900",
      mutedText: "text-gray-500",

      // Border colors
      borderColor: "border-gray-200",
      divider: "bg-gray-300",

       // Navigation and interaction states
    navItem: 'hover:bg-gray-200',
    activeNavItem: 'bg-gray-900', // Change from 'bg-gray-200' to 'bg-gray-900'
    navItemText: 'text-gray-800',
    activeNavItemText: 'text-white', // Add this new property

      
      // Icon colors
      iconColor: "text-gray-600",

      // Input fields
      input: "bg-white", // Added for compatibility

      // Hover and interactive states
      hoverBackground: "hover:bg-gray-100",

      // Theme-specific styles
      themeToggle: {
        base: "px-1 py-1 rounded-md transition-colors",
        dark: "hover:bg-gray-600",
        light: "text-gray-800 hover:bg-gray-300",
      },
    },
  };

  // Initialize theme from local storage
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      // If no saved theme, default to dark
      return savedTheme === null ? true : savedTheme === "dark";
    } catch (error) {
      // If there's an error, default to dark theme
      return true;
    }
  });

  // Determine current theme based on isDarkTheme
  const currentTheme = isDarkTheme ? themeClasses.dark : themeClasses.light;

  // Update local storage whenever theme changes
  useEffect(() => {
    try {
      localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    } catch (error) {
      console.error("Error saving theme to localStorage", error);
    }
  }, [isDarkTheme]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkTheme((prevTheme) => !prevTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        isDarkTheme,
        toggleTheme,
        themeClasses,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Theme toggle button component - updated with sliding design
export const ThemeToggle = () => {
  const { isDarkTheme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="flex justify-start mb-4">
      <button
        onClick={toggleTheme}
        className={`
          relative w-12 h-6 rounded-full p-1 transition-colors duration-200
          ${isDarkTheme ? "bg-gray-700" : "bg-gray-300"}
          cursor-pointer
        `}
        aria-label={`Switch to ${isDarkTheme ? "light" : "dark"} mode`}
      >
        <span
          className={`
            absolute top-1 w-4 h-4 rounded-full shadow-md
            transform transition-transform duration-200 ease-in-out
            ${
              isDarkTheme
                ? "translate-x-6 bg-white"
                : "translate-x-0 bg-gray-600"
            }
            pointer-events-none
          `}
        >
          {/* Subtle bubble effects inside the circle */}
          <span
            className={`
            absolute top-1 left-1 w-1 h-1 rounded-full opacity-70
            ${isDarkTheme ? "bg-gray-200" : "bg-gray-700"}
            pointer-events-none
          `}
          ></span>
        </span>
      </button>
    </div>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeProvider;
