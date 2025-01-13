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
          record: "#ffffff",
        },
        text: {
          primary: "#3E2723",
          secondary: "#6D4C41",
        },
        error: { main: "#ba1a1a" },

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
          main: "#adcfae",
        },
        tertiary: {
          main: "#e3c46d",
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
