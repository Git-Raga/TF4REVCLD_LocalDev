import React from 'react'
import ReactDOM from 'react-dom/client'
import Login from './components/Login'
import './index.css'
import App from './App.jsx'  // Fixed the import syntax

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)