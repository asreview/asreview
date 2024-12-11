export const theme = {
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#A08F63",
        },
        secondary: {
          main: "#6E9B73",
        },
        tertiary: {
          main: "#ffe08b",
        },
        background: {
          default: "#fffbf5",
          paper: "#f2ede4",
        },
        text: {
          primary: "#3E2723",
          secondary: "#6D4C41",
        },
        error: { main: "#D32F2F" },

        grey: {
          400: "#DEDBD2",
          600: "#2A3663",
          800: "#37474F",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#6F7E6F",
        },
        secondary: {
          main: "#64B5F6",
        },
        background: {
          default: "#121212",
          paper: "#1E1E1E",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#B0B0B0",
        },
        error: {
          main: "#FF6B6B",
        },

        grey: {
          400: "#4d4d4d",
          600: "#FFCC00",
          800: "#B0B0B0",
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
