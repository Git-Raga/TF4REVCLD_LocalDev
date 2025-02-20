import React, { useEffect } from 'react'; 
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ColorChange';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import FontConfig from './components/FontConfig';

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
  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('user');
 
  useEffect(() => {
    // Disable browser caching in development
    if (process.env.NODE_ENV === 'development') {
      // Disable caching strategies
      window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        e.returnValue = '';
      });

      // Add no-cache headers
      const meta1 = document.createElement('meta');
      meta1.httpEquiv = 'Cache-Control';
      meta1.content = 'no-cache, no-store, must-revalidate';
      document.head.appendChild(meta1);

      const meta2 = document.createElement('meta');
      meta2.httpEquiv = 'Pragma';
      meta2.content = 'no-cache';
      document.head.appendChild(meta2);

      const meta3 = document.createElement('meta');
      meta3.httpEquiv = 'Expires';
      meta3.content = '0';
      document.head.appendChild(meta3);
    }

    // Optional: Clear cache on initial load
    if (!localStorage.getItem('appInitialized')) {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('appInitialized', 'true');
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <FontConfig>
          <Routes>
            {/* Default route */}
            <Route 
              path="/" 
              element={isAuthenticated ? <Navigate to="/landing" replace /> : <Navigate to="/login" replace />} 
            />
            
            {/* Login Route */}
            <Route path="/login" element={<Login />} />
            
            {/* Landing Page Route */}
            <Route 
              path="/landing" 
              element={isAuthenticated ? <LandingPage /> : <Navigate to="/login" replace />} 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </FontConfig>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;