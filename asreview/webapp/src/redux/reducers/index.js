import {
  SET_ASREVIEW_VERSION,
  AUTHENTICATED,
  SET_PROJECT,
  TOGGLE_HELP_DIALOG,
} from "../../constants/action-types";

const initialState = {
  asreview_version: undefined,
  authenticated: false,
  project_id: null,
  onHelpDialog: false,
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case SET_ASREVIEW_VERSION:
      return Object.assign({}, state, {
        asreview_version: action.asreview_version,
      });
    case AUTHENTICATED:
      return Object.assign({}, state, {
        authenticated: action.authenticated,
      });
    case SET_PROJECT:
      return Object.assign({}, state, {
        project_id: action.project_id,
      });
    case TOGGLE_HELP_DIALOG:
      return Object.assign({}, state, {
        onHelpDialog: !state.onHelpDialog,
      });

    default:
      return state;
  }
}

export default rootReducer;
