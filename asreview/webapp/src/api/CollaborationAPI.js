import { axiosErrorHandler } from "./axiosErrorHandler";
import { collab_url } from "../globals.js";
import axios from "axios";
import qs from "qs";

class CollaborationAPI {
  static fetchPotentialCollaborators({params}) {
    console.log('params', params)
    const url = collab_url + `potential_collaborators`;
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

export default CollaborationAPI;