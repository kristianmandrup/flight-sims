import React from "react";
import ReactDOM from "react-dom/client"; // Import from 'react-dom/client'
import App from "./App";
import "./style.css"; // Your global styles

// Get the root element from index.html
const rootElement = document.getElementById("root");

// Ensure the root element exists before trying to render
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {" "}
      {/* Helps catch potential problems */}
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. Check your index.html file.");
}
