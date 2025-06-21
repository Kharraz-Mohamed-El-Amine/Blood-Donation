    import React from 'react'
    import ReactDOM from 'react-dom/client'
    import App from './App.jsx'
    import './index.css'
    import { AuthProvider } from './context/AuthContext'; // Importez AuthProvider

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <AuthProvider> {/* Enveloppez App avec AuthProvider */}
          <App />
        </AuthProvider>
      </React.StrictMode>,
    )
    