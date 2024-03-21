import {
  MY_PROJECTS,
  SET_PROJECT,
  TOGGLE_HELP_DIALOG,
} from "constants/action-types";

export function setProject(data) {
  return { type: SET_PROJECT, project_id: data };
}

export function toggleHelpDialog() {
  return { type: TOGGLE_HELP_DIALOG };
}

export function setMyProjects(data) {
  return { type: MY_PROJECTS, data: data };
}
