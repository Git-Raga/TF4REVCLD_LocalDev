import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "./ColorChange";

// Create a standalone toggle button component
const SidebarToggle = () => {
  const { currentTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
    
    // Apply class to the HTML tag instead of body to avoid React hydration issues
    if (!sidebarCollapsed) {
      document.documentElement.classList.add('sidebar-collapsed');
    } else {
      document.documentElement.classList.remove('sidebar-collapsed');
    }
  };

  // Add the styles only once on component mount
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'sidebar-toggle-styles';
    style.innerHTML = `
      /* Don't modify any existing React elements, just add pure CSS rules */
      html.sidebar-collapsed > body > div#root > div > div > div:first-of-type {
        width: 0 !important;
        min-width: 0 !important;
        overflow: hidden !important;
        transition: width 0.3s ease;
      }
      
      html:not(.sidebar-collapsed) > body > div#root > div > div > div:first-of-type {
        transition: width 0.3s ease;
      }
      
      /* Button styling */
      .sidebar-toggle-button {
        transition: transform 0.3s ease;
      }
      
      html.sidebar-collapsed .sidebar-toggle-button {
        transform: translateX(-220px);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.getElementById('sidebar-toggle-styles')) {
        document.head.removeChild(style);
      }
      document.documentElement.classList.remove('sidebar-collapsed');
    };
  }, []);
  
  // The button's appearance based on theme
  const buttonStyle = {
    position: 'fixed',
    top: '80px',
    left: '230px',
    zIndex: 1000,
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: currentTheme.name === 'dark' ? '#1e293b' : '#334155',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.3s ease'
  };
  
  return (
    <button
      className="sidebar-toggle-button"
      style={buttonStyle}
      onClick={toggleSidebar}
      aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
    </button>
  );
};

// Modified Layout component that just adds the toggle button
const Layout = ({ children }) => {
  return (
    <>
      <SidebarToggle />
      {children}
    </>
  );
};

export default Layout;