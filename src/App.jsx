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
        <div>
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

    // Listen for storage changes
    const handleStorageChange = (event) => {
      if (event.key === 'user') {
        setIsAuthenticated(!!event.newValue);
      }
    };

    // Add error event listener
    const handleError = (event) => {
      console.error('Uncaught error:', event.error);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('error', handleError);
    };
  }, [initializeApp]);

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
  element={
    (() => {
      
      return isAuthenticated ? <LandingPage /> : <Navigate to="/login" replace />;
    })()
  }
/>
            
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </FontConfig>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;