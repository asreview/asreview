import { CssBaseline } from "@mui/material";
import {
  createTheme,
  ThemeProvider,
  responsiveFontSizes,
} from "@mui/material/styles";
import App from "App";
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import { theme } from "constants/theme";
import { ScrollToTop } from "Components";

import "@fontsource/roboto-serif/400.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/kanit/500.css";
import "@fontsource/kanit/700.css";

const queryClient = new QueryClient();

function ASReviewApp() {
  let muiTheme = createTheme({
    // cssVariables: true,
    ...theme,
  });
  muiTheme = responsiveFontSizes(muiTheme);

  return (
    <React.StrictMode>
      <CssBaseline />
      <ThemeProvider theme={muiTheme}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ScrollToTop />
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<ASReviewApp />);
