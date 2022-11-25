import { axiosErrorHandler } from "./axiosErrorHandler";
import { collab_url } from "../globals.js";
import axios from "axios";


class TeamAPI {
  static fetchCollaborators(projectId) {
    if (projectId !== null) {
      const url = collab_url + `${projectId}/users`;
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
      const url = collab_url + `${projectId}/user/${userId}/invite`
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
      const url = collab_url + `${projectId}/user/${userId}/delete_invitation`
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

  static getProjectInvitations(userId) {
    if (userId !== null) {
      const url = collab_url + `${userId}/pending_invitations`
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

  static rejectInvitation(projectId, userId) {
    if (userId !== null && projectId !== null) {
      const url = collab_url + `${projectId}/user/${userId}/reject_invitation`
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

  static acceptInvitation(projectId, userId) {
    if (userId !== null && projectId !== null) {
      const url = collab_url + `${projectId}/user/${userId}/accept_invitation`
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

  static deleteCollaborator(projectId, userId) {
    if (userId !== null && projectId !== null) {
      const url = collab_url + `${projectId}/user/${userId}/delete_collaborator`
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

  static endCollaboration(projectId, userId) {
    if (userId !== null && projectId !== null) {
      const url = collab_url + `${projectId}/user/${userId}/end_collaboration`
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
