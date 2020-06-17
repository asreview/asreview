import { SET_PROJECT } from "../../constants/action-types";

const initialState = {
  project_id : null
};

function rootReducer(state = initialState, action) {
  if (action.type === SET_PROJECT) {
    state.project_id = action.payload;
  }
  return state;
}

export default rootReducer;