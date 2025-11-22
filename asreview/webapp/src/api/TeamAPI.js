import { axiosErrorHandler } from "./axiosErrorHandler";
import { api_url } from "globals.js";
import axios from "axios";

class TeamAPI {
  static fetchUsers({ queryKey }) {
    const projectId = queryKey[1];
    if (projectId !== null) {
      const url = api_url + `projects/${projectId}/users`;
      return new Promise((resolve, reject) => {
        axios
          .get(url, { withCredentials: true })
          .then((result) => {
            resolve(result["data"]);
          })
          .catch((error) => {
            reject(axiosErrorHandler(error));
          });
      });
    }
  }

  static deleteCollaboration(params) {
    const projectId = params.projectId;
    const userId = params.userId;
    if (userId !== null && projectId !== null) {
      const url = api_url + `projects/${projectId}/users/${userId}`;
      return new Promise((resolve, reject) => {
        axios({
          method: "delete",
          url: url,
          withCredentials: true,
        })
          .then((result) => {
            resolve(result["data"]);
          })
          .catch((error) => {
            reject(axiosErrorHandler(error));
          });
      });
    }
  }
}

export default TeamAPI;
