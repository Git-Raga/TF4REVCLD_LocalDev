import React, { useEffect, useState, useCallback } from 'react'; 
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ColorChange';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import FontConfig from './components/FontConfig';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1>Something went wrong.</h1>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('user');
  });
  
  const [isAppReady, setIsAppReady] = useState(false);

  const initializeApp = useCallback(() => {
    try {
      // Check if app was initialized
      const appInitialized = localStorage.getItem('appInitialized');
      
      if (!appInitialized) {
        // Save current theme BEFORE clearing
        const currentTheme = localStorage.getItem('theme');
        
        // Clear everything
        localStorage.clear();
        sessionStorage.clear();
        
        // Restore the theme if it existed
        if (currentTheme) {
          localStorage.setItem('theme', currentTheme);
        }
        
        // Mark app as initialized
        localStorage.setItem('appInitialized', 'true');
      }
  
      // Sync authentication state
      const userData = localStorage.getItem('user');
      setIsAuthenticated(!!userData);
    } catch (error) {
      console.error('App initialization error:', error);
    }
  }, []);

  useEffect(() => {
    // Initialize app
    initializeApp();

    // Smart loading detection with fallback timer
    let isReady = false;
    
    const setReady = () => {
      if (!isReady) {
        isReady = true;
        setIsAppReady(true);
        
        // Remove any loading screens from HTML
        const loadingElements = document.querySelectorAll('.css-loading, .initial-loading');
        loadingElements.forEach(el => {
          if (el && el.parentNode) {
            el.style.display = 'none';
          }
        });
        
        // Mark CSS as loaded
        document.documentElement.classList.add('css-loaded');
      }
    };

    // Check if resources are already loaded
    if (document.readyState === 'complete') {
      setTimeout(setReady, 100); // Minimal delay if already loaded
    } else {
      // Wait for window load event
      const handleLoad = () => setReady();
      window.addEventListener('load', handleLoad);
      
      // Fallback timer (reduced to 500ms)
      const fallbackTimer = setTimeout(setReady, 500);
      
      // Cleanup function
      const cleanup = () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(fallbackTimer);
      };
      
      // Store cleanup for later use
      window._appCleanup = cleanup;
    }

    // Listen for storage changes
    const handleStorageChange = (event) => {
      if (event.key === 'user') {
        setIsAuthenticated(!!event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (window._appCleanup) {
        window._appCleanup();
        delete window._appCleanup;
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initializeApp]);

  // Show loading until app is ready
  if (!isAppReady) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', margin: 0 }}>Loading TaskForce...</p>
        </div>
        
        {/* Add keyframes for spinner */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <FontConfig>
          <Routes>
            <Route 
              path="/" 
              element={isAuthenticated ? <Navigate to="/landing" replace /> : <Navigate to="/login" replace />} 
            />
            
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/landing" 
              element={isAuthenticated ? <LandingPage /> : <Navigate to="/login" replace />}
            />
            
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </FontConfig>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;