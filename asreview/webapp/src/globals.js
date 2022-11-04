// When you're running the development server, the javascript code is always
// pointing to localhost:5000. In all other configurations, the api url point to
// the host domain.

import { useTheme } from "@mui/material/styles";
import { setProject } from "./redux/actions";

import ASReviewLAB_black from "./images/asreview_sub_logo_lab_black_transparent.svg";
import ASReviewLAB_white from "./images/asreview_sub_logo_lab_white_transparent.svg";

export const base_url =
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1") &&
  window.location.port === "3000"
    ? "http://localhost:5000/"
    : "/";
export const api_url = base_url + "api/";
export const auth_url = base_url + "auth/";
export const collab_url = base_url + "collab/";

export const donateURL = "https://asreview.nl/donate";

export const feedbackURL =
  "https://github.com/asreview/asreview/issues/new/choose";

export const discussionsURL =
  "https://github.com/asreview/asreview/discussions";

export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          primary: {
            main: "#816700",
            light: "#FFCD00",
          },
          secondary: {
            main: "#076AED",
            light: "#3ea6ff",
          },
        }
      : {
          primary: {
            main: "#FFCD00",
          },
          secondary: {
            main: "#3ea6ff",
          },
        }),
  },
});

export const WordmarkState = () => {
  const theme = useTheme();
  if (theme.palette.mode === "dark") {
    return ASReviewLAB_white;
  } else {
    return ASReviewLAB_black;
  }
};

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
export const decisionUndoBarMarginBottom = 80;

export const checkIfSimulationFinishedDuration = 6000;

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
export const mapDispatchToProps = (dispatch) => {
  return {
    setProjectId: (project_id) => {
      dispatch(setProject(project_id));
    },
  };
};

// enums
export const projectModes = {
  ORACLE: "oracle",
  SIMULATION: "simulate",
  EXPLORATION: "explore",
};

export const projectStatuses = {
  SETUP: "setup",
  REVIEW: "review",
  FINISHED: "finished",
  ERROR: "error",
};

// project history filter options
export const historyFilterOptions = [
  { value: "note", label: "Contains note" },
  { value: "prior", label: "Prior knowledge" },
];
