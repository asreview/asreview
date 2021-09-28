// When you're running the development server, the javascript code is always
// pointing to localhost:5000. In all other configurations, the api url point to
// the host domain.

export const base_url =
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1") &&
  window.location.port === "3000"
    ? "http://localhost:5000/"
    : "/";
export const api_url = base_url + "api/";

export const donateURL = "https://asreview.nl/donate";

export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          primary: {
            main: "#7a4f01",
          },
          secondary: {
            main: "#7a0c2e",
          }
        }
      : {
          primary: {
            main: "#fff7cd",
          },
          secondary: {
            main: "#ffe7d9",
          },
        }),
  },
});

// export const lightTheme = {
//   palette: {
//     mode: "light",
//     primary: {
//       main: "#7a4f01",
//     },
//     secondary: {
//       main: "#7a0c2e",
//     }
//   },
//   props: {
//     MuiAppBar: {
//       color: 'transparent',
//     },
//   },
  // overrides: {
  //   MuiLink: {
  //     root: {
  //       // color: "#DC004E",
  //     },
  //   },
  //   MuiTypography: {
  //     colorTextSecondary: {
  //       color: "#555555",
  //     },
  //   },
  //   MuiDialog: {
  //     paper: {
  //       backgroundColor: "#fafafa",
  //     },
  //   },
  //   MuiListItem: {
  //     root: {
  //       "&$selected": {
  //         color: "#91620B",
  //         backgroundColor: "#FFFBE7",
  //       },
  //     },
  //   },
  // },
// };

// export const darkTheme = {
//   palette: {
//     mode: "dark",
//     primary: {
//       main: "#fff7cd",
//     },
//     secondary: {
//       main: "#ffe7d9",
//     },
//   },
//   props: {
//     MuiAppBar: {
//       color: 'transparent',
//     },
//   },
  // overrides: {
  //   MuiLink: {
  //     root: {
  //       color: "#F48FB1",
  //     },
  //   },
  //   MuiButton: {
  //     textPrimary: {
  //       color: "#CFA596",
  //     },
  //     outlinedPrimary: {
  //       color: "#CFA596",
  //     },
  //   },
  //   MuiTypography: {
  //     colorPrimary: {
  //       color: "#CFA596",
  //     },
  //   },
  //   MuiFormLabel: {
  //     root: {
  //       "&$focused": {
  //         color: "#CFA596",
  //       },
  //     },
  //   },
  //   MuiTab: {
  //     textColorPrimary: {
  //       "&$selected": {
  //         color: "#CFA596",
  //       },
  //     },
  //   },
  //   MuiDialog: {
  //     paper: {
  //       backgroundColor: "#303030",
  //     },
  //   },
  // },
// };

// project state color
export const setupColor = "#706f6f";
export const inReviewColor = "#aa6600";
export const finishedColor = "#415f38";

// algorithm settings configs
export const defaultAlgorithms = {
  model: "nb",
  query_strategy: "max",
  feature_extraction: "tfidf",
};

// drawer configs
export const drawerWidth = 250;

// review screen configs
export const decisionUndoBarDuration = 6000;
export const decisionUndoBarMarginBottom = 90;

export const fontSizeOptions = [
  {
    value: 1,
    label: "Small",
  },
  {
    value: 2,
    label: "Default",
  },
  {
    value: 3,
    label: "Large",
  },
  {
    value: 4,
    label: "Largest",
  },
];

// functions
export const mapStateToProps = (state) => {
  return { project_id: state.project_id };
};

// enums
export const projectModes = {
  ORACLE: "oracle",
  SIMULATION: "simulate",
  EXPLORATION: "explore",
};
