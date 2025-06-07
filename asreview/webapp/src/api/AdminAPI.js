import { axiosErrorHandler } from "./axiosErrorHandler";
import axios from "axios";

const admin_url = window.api_url + "admin/";

class AdminAPI {
  // Get all users
  static fetchUsers() {
    const url = admin_url + "users";
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

  // Get a specific user by ID
  static fetchUser(userId) {
    const url = admin_url + `users/${userId}`;
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

  // Create a new user
  static createUser(userData) {
    const url = admin_url + "users";
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: userData,
        headers: {
          "Content-Type": "application/json",
        },
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

  // Update an existing user
  static updateUser(userId, userData) {
    const url = admin_url + `users/${userId}`;
    return new Promise((resolve, reject) => {
      axios({
        method: "put",
        url: url,
        data: userData,
        headers: {
          "Content-Type": "application/json",
        },
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

  // Delete a user
  static deleteUser(userId) {
    const url = admin_url + `users/${userId}`;
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

  // Get all projects
  static fetchProjects() {
    const url = admin_url + "projects";
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

  // Transfer project ownership
  static transferProjectOwnership(projectId, newOwnerId) {
    const url = admin_url + `projects/${projectId}/transfer-ownership`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: { new_owner_id: newOwnerId },
        headers: {
          "Content-Type": "application/json",
        },
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

export default AdminAPI;
