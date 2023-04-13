import { axiosErrorHandler } from "./axiosErrorHandler";
import { api_url } from "../globals.js";
import axios from "axios";


class TeamAPI {

  static getProjectInvitations() {
    const url = api_url + `invitations`
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


  static fetchCollaborators(projectId) {
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
    } else {
      return {}
    }
  }

  static inviteUser(projectId, userId) {
    if (projectId !== null && userId !== null) {
      const url = api_url + `invitations/projects/${projectId}/users/${userId}`
      return new Promise((resolve, reject) => {
        axios({
          method: "post",
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

  static deleteInvitation(projectId, userId) {
    if (projectId !== null && userId !== null) {
      const url = api_url + `invitations/projects/${projectId}/users/${userId}`
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


  static rejectInvitation(projectId) {
    if (projectId !== null) {
      const url = api_url + `invitations/projects/${projectId}/reject`
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

  static acceptInvitation(projectId) {
    if (projectId !== null) {
      const url = api_url + `invitations/projects/${projectId}/accept`
      return new Promise((resolve, reject) => {
        axios({
          method: "post",
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

  static endCollaboration(projectId, userId) {
    if (userId !== null && projectId !== null) {
      const url = api_url + `projects/${projectId}/users/${userId}`
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
