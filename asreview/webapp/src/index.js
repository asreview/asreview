import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider } from "context/AuthProvider";
import store from "redux/store";
import App from "App";

function ASReviewApp() {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="*" element={<App />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<ASReviewApp />);
