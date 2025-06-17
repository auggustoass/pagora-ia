
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure React is available globally BEFORE any imports that might use it
if (typeof window !== 'undefined') {
  // Make React available globally
  (window as any).React = React;
  
  // Make React hooks available globally for dependencies that might need them
  (window as any).useState = React.useState;
  (window as any).useEffect = React.useEffect;
  (window as any).useContext = React.useContext;
  (window as any).useRef = React.useRef;
  (window as any).useMemo = React.useMemo;
  (window as any).useCallback = React.useCallback;
  (window as any).useReducer = React.useReducer;
  (window as any).useLayoutEffect = React.useLayoutEffect;
  (window as any).useImperativeHandle = React.useImperativeHandle;
  (window as any).useDebugValue = React.useDebugValue;
  
  // Ensure the React object itself has all necessary properties
  if (!React.useEffect) {
    console.error('React.useEffect is not available!');
  }
}

// Add a small delay to ensure everything is properly initialized
const initializeApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  // Verify React is properly initialized before creating the root
  if (!React || !React.useEffect) {
    console.error('React hooks are not properly initialized');
    setTimeout(initializeApp, 100);
    return;
  }

  try {
    createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    // Retry after a short delay
    setTimeout(initializeApp, 100);
  }
};

// Initialize the app
initializeApp();
