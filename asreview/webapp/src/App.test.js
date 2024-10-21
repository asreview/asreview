import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

it("renders without crashing", () => {
  const container = document.getElementById("root");
  const root = createRoot(container);
  root.render(<App tab="home" />);
});
