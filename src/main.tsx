import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './auth/context/AuthContext'
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <HelmetProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </HelmetProvider>
  </AuthProvider>
)
