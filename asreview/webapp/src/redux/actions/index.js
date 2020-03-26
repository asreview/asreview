import { SET_PROJECT } from "../../constants/action-types";

export function setProject(payload) {
  return { type: SET_PROJECT, payload };
}