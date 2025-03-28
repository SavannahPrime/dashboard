
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx'
import './index.css'

// Create a root once
const root = createRoot(document.getElementById("root")!);

// Render our app
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
