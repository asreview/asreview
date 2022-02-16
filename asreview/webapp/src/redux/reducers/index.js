import {
  SET_ASREVIEW_VERSION,
  SET_PROJECT,
  SET_APP_STATE,
  TOGGLE_HELP_DIALOG,
} from "../../constants/action-types";

const initialState = {
  asreview_version: undefined,
  app_state: "boot",
  project_id: null,
  onHelpDialog: false,
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case SET_ASREVIEW_VERSION:
      return Object.assign({}, state, {
        asreview_version: action.asreview_version,
      });
    case SET_PROJECT:
      return Object.assign({}, state, {
        project_id: action.project_id,
      });
    case SET_APP_STATE:
      if (action.app_state === "boot" || action.app_state === "home") {
        return Object.assign({}, state, {
          app_state: action.app_state,
          project_id: null,
        });
      } else {
        return Object.assign({}, state, {
          app_state: action.app_state,
        });
      }
    case TOGGLE_HELP_DIALOG:
      return Object.assign({}, state, {
        onHelpDialog: !state.onHelpDialog,
      });

    default:
      return state;
  }
}

export default rootReducer;
