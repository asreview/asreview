import { SET_PROJECT, SET_APP_STATE } from "../../constants/action-types";

const initialState = {
  app_state : "boot",
  project_id : null,
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case SET_PROJECT:
      console.log("Project id set: " + action.project_id)
      return Object.assign({}, state, {
        project_id: action.project_id
      })
    case SET_APP_STATE:

      if (action.app_state === 'boot' || action.app_state === 'projects'){
        return Object.assign({}, state, {
          app_state: action.app_state,
          project_id: null,
        })
      } else {
        return Object.assign({}, state, {
          app_state: action.app_state,
        })
      }

    default:
      return state
  }

}

export default rootReducer;
