import { createTheme } from "@mui/material/styles";
import colors from "./colors.json";

const resolveMode = (mode, prefersDarkMode) => {
  if (mode === "system") {
    return prefersDarkMode ? "dark" : "light";
  }
  return mode;
};

const getTheme = (mode, prefersDarkMode) => {
  const effectiveMode = resolveMode(mode, prefersDarkMode);

  return createTheme({
    palette: {
      mode: effectiveMode,
      primary: {
        main: colors[effectiveMode].primary,
        contrastText: colors[effectiveMode].contrastTextPrimary || "#FFFFFF",
      },
      secondary: {
        main: colors[effectiveMode].secondary,
        contrastText: colors[effectiveMode].contrastTextSecondary || "#FFFFFF",
      },
      background: {
        default: colors[effectiveMode].background,
        paper: colors[effectiveMode].surface,
      },
      text: {
        primary: colors[effectiveMode].textPrimary,
        secondary: colors[effectiveMode].textSecondary,
      },
      error: {
        main: colors[effectiveMode].error,
        contrastText: colors[effectiveMode].contrastTextError || "#FFFFFF",
      },
      grey: colors[effectiveMode].grey,
      contrast: colors[effectiveMode].contrast,
      accent: colors[effectiveMode].accent,
    },
  });
};

export default getTheme;
