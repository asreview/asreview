import {
  SET_ASREVIEW_VERSION,
  AUTHENTICATION,
  SET_PROJECT,
  TOGGLE_HELP_DIALOG,
  SET_BOOT_DATA,
  MY_PROJECTS,
} from "../../constants/action-types";

// note: I am not too sure about these functions, they
// shield the dispatch type from the developer, but
// it complicates the API by adding yet another layer
// of functions. As far as I am concerned these can go. 
export function setASReviewVersion(data) {
  return { type: SET_ASREVIEW_VERSION, asreview_version: data };
}

export function setAuthentication(data) {
  return { type: AUTHENTICATION, authentication: data };
}

export function setProject(data) {
  return { type: SET_PROJECT, project_id: data };
}

export function toggleHelpDialog() {
  return { type: TOGGLE_HELP_DIALOG };
}

export function setBootData(data) {
  return { type: SET_BOOT_DATA, data: data };
}

export function setMyProjects(data) {
  return { type: MY_PROJECTS, data: data };
}
