import { SET_PROJECT } from "../../constants/action-types";

export function setProject(project_id) {
	console.log("set project " + project_id)
  return { type: SET_PROJECT, project_id };
}
