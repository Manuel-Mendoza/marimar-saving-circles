import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Suppress recharts defaultProps warnings in development
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args) => {
    if (args[0]?.includes && (
      args[0].includes('Support for defaultProps will be removed from function components') ||
      args[0].includes('defaultProps') ||
      args[0].includes('XAxis') ||
      args[0].includes('YAxis')
    )) {
      return; // Suppress the warning
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args) => {
    if (args[0]?.includes && (
      args[0].includes('Support for defaultProps will be removed from function components') ||
      args[0].includes('defaultProps') ||
      args[0].includes('XAxis') ||
      args[0].includes('YAxis')
    )) {
      return; // Suppress the warning
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
