import {
	SET_PROJECT,
	SET_APP_STATE,
	TOGGLE_REVIEW_DRAWER,
} from "../../constants/action-types";

export function setProject(project_id) {
  return { type: SET_PROJECT, project_id };
}

export function setAppState(app_state) {
  return { type: SET_APP_STATE, app_state };
}

export function toggleReviewDrawer() {
  return { type: TOGGLE_REVIEW_DRAWER};
}
