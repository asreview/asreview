import {
  SET_ASREVIEW_VERSION,
  AUTHENTICATED,
  SET_PROJECT,
  TOGGLE_HELP_DIALOG,
} from "../../constants/action-types";

export function setASReviewVersion(asreview_version) {
  return { type: SET_ASREVIEW_VERSION, asreview_version };
}

export function setAuthenticated(authenticated) {
  return { type: AUTHENTICATED, authenticated };
}

export function setProject(project_id) {
  return { type: SET_PROJECT, project_id };
}

export function toggleHelpDialog() {
  return { type: TOGGLE_HELP_DIALOG };
}
