import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "context/AuthProvider";
import App from "App";

function ASReviewApp() {
  return (
    <React.StrictMode>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="*" element={<App />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
  );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<ASReviewApp />);
