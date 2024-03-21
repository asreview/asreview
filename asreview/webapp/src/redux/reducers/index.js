import {
  MY_PROJECTS,
  SET_PROJECT,
  TOGGLE_HELP_DIALOG,
} from "constants/action-types";

const initialState = {
  project_id: null,
  onHelpDialog: false,
  myProjects: [],
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case SET_PROJECT:
      return Object.assign({}, state, {
        project_id: action.project_id,
      });
    case TOGGLE_HELP_DIALOG:
      return Object.assign({}, state, {
        onHelpDialog: !state.onHelpDialog,
      });
    // set my projects list
    case MY_PROJECTS:
      return Object.assign({}, state, {
        myProjects: action.data,
      });
    // default
    default:
      return state;
  }
}

export default rootReducer;
