import { axiosErrorHandler } from "./axiosErrorHandler";
import { collab_url } from "../globals.js";
import axios from "axios";

class CollaborationAPI {
  static fetchCollaborators(projectId) {
    if (projectId !== null) {
      const url = collab_url + `collaborators/${projectId}`;
      console.log(url)
      return new Promise((resolve, reject) => {
        axios
          .get(url, { withCredentials: true })
          .then((result) => {
            console.log('result', result["data"])
            resolve(result["data"]);
          })
          .catch((error) => {
            reject(axiosErrorHandler(error));
          });
      });
    } else {
      return {}
    }
  }
}

export default CollaborationAPI;