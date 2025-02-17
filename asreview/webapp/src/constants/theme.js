// Theme for the ASReview webapp.
// The theme is based on the Material-UI theme.
//
// - The primary color is a greybrown color which is used
// for the main color of buttons and other primary elements.
// - The secondary color is a green color which is used for
// elements that need to stand out or focused. Think about
// the color of the buttons in the navrail or the color of
// the label section in the RecordCard.
// - The tertiary color is a yellow color which is used for
// elements that indicate relevant records or information.
// Think about the color of the relevant label in the
// RecordCard or the color of relevant records on the
// Dashboard.
// - grey.400 is a light grey color which is used for
// elements that indicate unlabeled records or information.
// - The primary color is also used for elements that below to
// not relevant records, like the color of the not relevant
// label in the RecordCard.
// - The background color is a light beige color which is used
// for the background of the app.

import { alpha, getContrastRatio } from "@mui/material/styles";

export const theme = {
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#7e7667", // greybrown
        },
        secondary: {
          main: "#6E9B73", // green
        },
        // custom color for relevant elements
        tertiary: {
          main: "#ffe08b", // yellow, alternative: e3c46d
          light: alpha("#ffe08b", 0.5),
          dark: "#e3c46d",
          contrastText:
            getContrastRatio("#ffe08b", "#000") >= 3 ? "#000" : "#fff",
        },
        background: {
          default: "#fffdfa",
          paper: "#f2ece4",
          record: "#ffffff",
        },
        text: {
          primary: "#2b1d1a",
          secondary: "#6D4C41",
        },
        error: { main: "#ba1a1a" },

        grey: {
          400: "#DEDBD2",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#8d8f8d",
        },
        secondary: {
          main: "#adcfae",
        },
        // custom color for relevant elements
        tertiary: {
          main: "#e3c46d",
          light: alpha("#ffe08b", 0.5),
          dark: "#FFCC00",
          contrastText:
            getContrastRatio("#e3c46d", "#000") >= 3 ? "#000" : "#fff",
        },
        background: {
          default: "#16130b",
          paper: "#231f17",
          record: "#110e07",
        },
        text: {
          primary: "#eae1d4",
          secondary: "#B0B0B0",
        },
        error: {
          main: "#93000a",
        },

        grey: {
          400: "#4d4d4d",
          600: "#333333",
        },
      },
    },
  },
  components: {
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
  },
};
