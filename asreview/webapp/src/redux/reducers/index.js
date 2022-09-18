import {
  SET_ASREVIEW_VERSION,
  AUTHENTICATION,
  SET_PROJECT,
  TOGGLE_HELP_DIALOG,
} from "../../constants/action-types";

const initialState = {
  asreview_version: undefined,
  authentication: undefined,
  project_id: null,
  onHelpDialog: false,
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case SET_ASREVIEW_VERSION:
      console.log("set asreview version", action)
      return Object.assign(state, {
        asreview_version: action.asreview_version,
      });
    case AUTHENTICATION:
      console.log("set authenticated reducer", action)
      console.log('---------');
      console.log(state);
      console.log(action);
      console.log(Object.assign({}, state, {authentication: action.authentication}));
      console.log('---------');
      return Object.assign(state, {
        authentication: action.authentication,
      });
    case SET_PROJECT:
      return Object.assign(state, {
        project_id: action.project_id,
      });
    case TOGGLE_HELP_DIALOG:
      return Object.assign(state, { 
        onHelpDialog: !state.onHelpDialog,
      });

    default:
      return state;
  }
}

export default rootReducer;
