import { useTheme } from "@mui/material/styles";
import { setProject } from "redux/actions";

import ASReviewLAB_black from "./images/asreview_sub_logo_lab_black_transparent.svg";
import ASReviewLAB_white from "./images/asreview_sub_logo_lab_white_transparent.svg";

export const api_url = window.api_url + "api/";
export const auth_url = window.api_url + "auth/";
export const collab_url = window.api_url + "team/";

export const asreviewURL = "https://asreview.nl/";
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
            main: "#463EA6",
            light: "#a7a9df",
            background: "#93494914",
          },
          secondary: {
            main: "#9da63e",
            light: "#e3f4a8",
          },
        }
      : {
          primary: {
            main: "#FFD700",
            background: "#93494914",
          },
          secondary: {
            main: "#FFD700",
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
  classifier: "nb",
  query_strategy: "max",
  feature_extraction: "tfidf",
  balance_strategy: "double",
};

// drawer configs
export const drawerWidth = 250;

export const checkIfSimulationFinishedDuration = 6000;

export const fontSizeOptions = ["Small", "Default", "Large", "Largest"];

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

  return (
    yup_string
      // check minimum characters
      .min(8, "Password must have at least 8 characters")
      // different error messages for different requirements
      .matches(/[0-9]/, getCharacterValidationError("digit"))
      .matches(/[a-z]/, getCharacterValidationError("lowercase"))
      .matches(/[A-Z]/, getCharacterValidationError("uppercase"))
  );
};

export const passwordRequirements =
  "Your password must be at least 8 characters long and includes at least one number, one lowercase letter, and one uppercase letter.";

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
};
