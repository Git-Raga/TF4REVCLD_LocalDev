import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for the theme
export const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Tailwind-friendly theme classes
  const themeClasses = {
    dark: {
      // Background colors
      background: 'bg-[#1C1C1F]',
      sidebar: 'bg-[#2C2C30]',
      cardBackground: 'bg-[#2C2C30]',
      
      // Text colors
      text: 'text-white',
      mutedText: 'text-gray-400',
      
      // Border colors
      borderColor: 'border-gray-800',
      divider: 'bg-gray-700',
      
      // Navigation and interaction states
      navItem: 'hover:bg-gray-800',
      activeNavItem: 'bg-gray-800',
      navItemText: 'text-gray-300',
      
      // Icon colors
      iconColor: 'text-gray-400',
      
      // Hover and interactive states
      hoverBackground: 'hover:bg-gray-700',
      
      // Theme-specific styles
      themeToggle: {
        base: 'px-1 py-1 rounded-md transition-colors',
        dark: 'text-white hover:bg-gray-600',
        light: 'hover:bg-gray-300'
      }
    },
    light: {
      // Background colors
      background: 'bg-white',
      sidebar: 'bg-gray-100',
      cardBackground: 'bg-white',
      
      // Text colors
      text: 'text-gray-900',
      mutedText: 'text-gray-500',
      
      // Border colors
      borderColor: 'border-gray-200',
      divider: 'bg-gray-200',
      
      // Navigation and interaction states
      navItem: 'hover:bg-gray-200',
      activeNavItem: 'bg-gray-200',
      navItemText: 'text-gray-800',
      
      // Icon colors
      iconColor: 'text-gray-600',
      
      // Hover and interactive states
      hoverBackground: 'hover:bg-gray-100',
      
      // Theme-specific styles
      themeToggle: {
        base: 'px-1 py-1 rounded-md transition-colors',
        dark: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        light: 'text-white hover:bg-gray-600'
      }
    }
  };

  // Initialize theme from local storage
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      // If no saved theme, default to dark
      return savedTheme === null ? true : savedTheme === 'dark';
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
      localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme to localStorage', error);
    }
  }, [isDarkTheme]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkTheme(prevTheme => !prevTheme);
  };

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      isDarkTheme, 
      toggleTheme,
      themeClasses 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme toggle button component
export const ThemeToggle = () => {
  const { isDarkTheme, toggleTheme, currentTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className={`${currentTheme.themeToggle.base} ${
        isDarkTheme 
          ? currentTheme.themeToggle.dark 
          : currentTheme.themeToggle.light
      }`}
    >
      {isDarkTheme ? '⚪' : '⚫'}
    </button>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;