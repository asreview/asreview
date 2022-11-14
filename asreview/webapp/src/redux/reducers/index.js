import {
  SET_ASREVIEW_VERSION,
  AUTHENTICATION,
  SET_PROJECT,
  TOGGLE_HELP_DIALOG,
  SET_BOOT_DATA,
  MY_PROJECTS,
} from "../../constants/action-types";

const initialState = {
  asreview_version: undefined,
  authentication: undefined,
  status: undefined,
  project_id: null,
  onHelpDialog: false,
  myProjects: [],
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case SET_ASREVIEW_VERSION:
      return Object.assign({}, state, {
        asreview_version: action.asreview_version,
      });
    case AUTHENTICATION:
      return Object.assign({}, state, {
        authentication: action.authentication,
      });
    case SET_PROJECT:
      return Object.assign({}, state, {
        project_id: action.project_id,
      });
    case TOGGLE_HELP_DIALOG:
      return Object.assign({}, state, { 
        onHelpDialog: !state.onHelpDialog,
      });
    // set boot data
    case SET_BOOT_DATA:
      return Object.assign({}, state, {
        asreview_version: action.data.version,
        authentication: action.data.authentication,
        status: action.data.status
      });
    // set my projects list
    case MY_PROJECTS:
      return Object.assign({}, state, {
        myProjects: action.data
      });
    default:
      return state;
  }
}

export default rootReducer;
