import { SET_PROJECT } from "../../constants/action-types";

const initialState = {
  project_id : null
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case SET_PROJECT:
      return Object.assign({}, state, {
        project_id: action.project_id
      })
    default:
      return state
  }

}

export default rootReducer;
