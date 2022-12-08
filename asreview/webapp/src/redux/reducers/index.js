import {
  AUTHENTICATION,
  MY_PROJECTS,
  OAUTH_SERVICES,
  SET_ASREVIEW_VERSION,
  SET_BOOT_DATA,
  SET_PROJECT,
  TOGGLE_HELP_DIALOG,
} from "../../constants/action-types";

const initialState = {
  asreview_version: undefined,
  authentication: undefined,
  email_verification: undefined,
  allow_account_creation: undefined,
  oAuthData: {
    services: {},
    compareKey: 'oAuthCompareKey',  // these 2 values are used when the oAuth
    messageType: 'oAuthMessage'     // popup has to communicate with the opener
  },
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
        status: action.data.status,
        email_verification: action.data.email_verification,
        allow_account_creation: action.data.allow_account_creation,
      });
    // set my projects list
    case MY_PROJECTS:
      return Object.assign({}, state, {
        myProjects: action.data
      });
    // set OAuth services
    case OAUTH_SERVICES: {
      const newState = {
        ...state.oAuthData,
        services: action.data
      }
      return Object.assign({}, state, {
        oAuthData: newState
      });
    }
    // default
    default:
      return state;
  }
}

export default rootReducer;
