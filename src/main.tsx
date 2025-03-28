
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Use createRoot for React 18's concurrent mode
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

// Create the root once and store it
const root = createRoot(rootElement);

// Render the app with React's strict mode for development safety
root.render(<App />);
