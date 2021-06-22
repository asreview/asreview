import {
  SET_ASREVIEW_VERSION,
  SET_PROJECT,
  SET_ACCESS_TOKEN,
  SET_USER,
  SET_APP_STATE,
  TOGGLE_REVIEW_DRAWER,
} from "../../constants/action-types";

export function setASReviewVersion(asreview_version) {
  return { type: SET_ASREVIEW_VERSION, asreview_version };
}

export function setProject(project_id) {
  return { type: SET_PROJECT, project_id };
}

export function setUser(user_id) {
  return { type: SET_USER, user_id };
}

export function setAccessToken(access_token) {
  return { type: SET_ACCESS_TOKEN, access_token };
}

export function setAppState(app_state) {
  return { type: SET_APP_STATE, app_state };
}

export function toggleReviewDrawer() {
  return { type: TOGGLE_REVIEW_DRAWER };
}

