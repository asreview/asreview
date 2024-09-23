import { createTheme } from "@mui/material/styles";
import colors from "./colors.json";

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: colors[mode].primary,
        contrastText: "FFFFFF",
      },
      secondary: {
        main: colors[mode].secondary,
        contrastText: "#FFFFFF",
      },
      background: {
        default: colors[mode].background,
        paper: colors[mode].surface,
      },
      text: {
        primary: colors[mode].textPrimary,
        secondary: colors[mode].textSecondary,
      },
      error: {
        main: colors[mode].error,
        contrastText: "#FFFFFF",
      },
      grey: colors[mode].grey,
      contrast: colors[mode].contrast,
      accent: colors[mode].accent,
    },
  });

export default getTheme;
