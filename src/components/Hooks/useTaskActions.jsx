import { useState, useEffect } from 'react';
import { useTheme } from '../../../ColorChange';

export const useSidebarToggle = () => {
  const { currentTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  useEffect(() => {
    // Create style element for sidebar toggle functionality
    const style = document.createElement('style');
    style.id = 'sidebar-toggle-styles';
    style.innerHTML = `
      /* Toggle button styles */
      .sidebar-toggle-btn {
        position: fixed;
        z-index: 9999;
        top: 80px;
        left: ${sidebarCollapsed ? '10px' : '230px'};
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: ${currentTheme.name === 'dark' ? '#1e293b' : '#334155'};
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: left 0.3s ease;
      }
      
      /* Use multiple selectors to target the sidebar with high specificity */
      body.sidebar-collapsed .sidebar-nav,
      body.sidebar-collapsed #root > div > div:first-child,
      body.sidebar-collapsed [class*="sidebar"] {
        width: 0 !important;
        min-width: 0 !important;
        max-width: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        overflow: hidden !important;
        opacity: 0 !important;
        visibility: hidden !important;
        transition: all 0.3s ease !important;
      }
      
      body:not(.sidebar-collapsed) .sidebar-nav,
      body:not(.sidebar-collapsed) #root > div > div:first-child,
      body:not(.sidebar-collapsed) [class*="sidebar"] {
        width: 240px !important;
        min-width: 240px !important;
        transition: all 0.3s ease !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      /* Main content adjustment */
      body.sidebar-collapsed .main-content {
        margin-left: 0 !important;
        transition: margin-left 0.3s ease !important;
        width: 100% !important;
      }
      
      body:not(.sidebar-collapsed) .main-content {
        margin-left: 240px !important;
        transition: margin-left 0.3s ease !important;
        width: calc(100% - 240px) !important;
      }
    `;
    
    document.head.appendChild(style);
    
    // Apply initial sidebar state
    if (sidebarCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
    
    // Clean up function
    return () => {
      if (document.getElementById('sidebar-toggle-styles')) {
        document.head.removeChild(style);
      }
      document.body.classList.remove('sidebar-collapsed');
    };
  }, [sidebarCollapsed, currentTheme.name]);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const newState = !prev;
      if (newState) {
        document.body.classList.add('sidebar-collapsed');
      } else {
        document.body.classList.remove('sidebar-collapsed');
      }
      return newState;
    });
  };

  return { sidebarCollapsed, toggleSidebar };
};