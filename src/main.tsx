
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure React is available globally before any components render
if (typeof window !== 'undefined') {
  (window as any).React = React;
  // Also ensure React hooks are available globally
  (window as any).useState = React.useState;
  (window as any).useEffect = React.useEffect;
  (window as any).useContext = React.useContext;
  (window as any).useRef = React.useRef;
  (window as any).useMemo = React.useMemo;
  (window as any).useCallback = React.useCallback;
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
