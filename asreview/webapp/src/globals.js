import { useTheme } from "@mui/material/styles";
import { setProject } from "./redux/actions";

import ASReviewLAB_black from "./images/asreview_sub_logo_lab_black_transparent.svg";
import ASReviewLAB_white from "./images/asreview_sub_logo_lab_white_transparent.svg";

// URL of backend is configured in an .env file. By default it's 
// the same as the front-end URL.
let b_url = "/";
if (Boolean(process.env.REACT_APP_API_URL)) {
  b_url = process.env.REACT_APP_API_URL;
}
export const base_url = b_url;
export const api_url = base_url + "api/";
export const auth_url = base_url + "auth/";
export const collab_url = base_url + "team/";

export const donateURL = "https://asreview.nl/donate";

export const communityURL = "https://asreview.nl/community";

export const feedbackURL =
  "https://github.com/asreview/asreview/issues/new/choose";

export const discussionsURL =
  "https://github.com/asreview/asreview/discussions";

export const getDesignTokens = (mode) => ({
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

export const passwordValidation = (yup_string) => {
  // error messages
  const getCharacterValidationError = (str) => {
    return `Your password must have at least 1 ${str} character`;
  };

  return yup_string
    // check minimum characters
    .min(8, "Password must have at least 8 characters")
    // different error messages for different requirements
    .matches(/[0-9]/, getCharacterValidationError("digit"))
    .matches(/[a-z]/, getCharacterValidationError("lowercase"))
    .matches(/[A-Z]/, getCharacterValidationError("uppercase"))
};

/**
 * Format date and mode
 */
export const formatDate = (datetime) => {
  let date = new Date(datetime * 1000);
  let dateString = date.toDateString().slice(4);
  let dateDisplay =
    dateString.replace(/\s+\S*$/, ",") + dateString.match(/\s+\S*$/);
  return dateDisplay;
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
