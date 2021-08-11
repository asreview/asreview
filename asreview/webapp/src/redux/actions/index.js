import {
  SET_ASREVIEW_VERSION,
  SET_PROJECT,
  SET_APP_STATE,
} from "../../constants/action-types";

export function setASReviewVersion(asreview_version) {
  return { type: SET_ASREVIEW_VERSION, asreview_version };
}

export function setProject(project_id) {
  return { type: SET_PROJECT, project_id };
}

export function setAppState(app_state) {
  return { type: SET_APP_STATE, app_state };
}
