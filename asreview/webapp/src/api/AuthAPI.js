import { axiosErrorHandler } from "./axiosErrorHandler";
import { auth_url } from "../globals.js";
import axios from "axios";

class AuthAPI {
  static signup(variables) {
    let body = new FormData();
    body.set("password", variables.password);
    body.set("name", variables.name);
    body.set("affiliation", variables.affiliation);
    body.set("email", variables.email);
    body.set("public", variables.publicAccount === true ? 1 : 0);

    const url = auth_url + `signup`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: body,
      })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static signin(variables) {
    let body = new FormData();
    body.set("email", variables.email);
    body.set("password", variables.password);

    const url = auth_url + `signin`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: body,
        // This is essential, allows cookies to be created through Headers
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

  static forgotPassword(variables) {
    let body = new FormData();
    body.set("email", variables.email);

    const url = auth_url + `forgot_password`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: body,
      })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static confirmAccount(variables) {
    let body = new FormData();
    body.set("user_id", variables.userId);
    body.set("token", variables.token);

    const url = auth_url + `confirm_account`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: body,
      })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static refresh() {
    const url = auth_url + `refresh`;
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

  static signout(variables) {
    const url = auth_url + `signout`;
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

  static getProfile() {
    const url = auth_url + `get_profile`;
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

  static updateProfile(variables) {
    let body = new FormData();
    body.set("old_password", variables.oldPassword);
    body.set("new_password", variables.newPassword);
    body.set("name", variables.name);
    body.set("affiliation", variables.affiliation);
    body.set("email", variables.email);
    body.set("public", variables.publicAccount === true ? 1 : 0);

    const url = auth_url + `update_profile`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: body,
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

  static resetPassword(variables) {
    let body = new FormData();
    body.set("password", variables.password);
    body.set("token", variables.token);
    body.set("user_id", variables.userId);

    const url = auth_url + `reset_password`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: body,
      })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static oAuthCallback(data) {
    let body = new FormData();
    body.set("code", data.code);
    body.set("provider", data.provider);
    body.set("redirect_uri", data.redirect_uri);
    const url = auth_url + `oauth_callback`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: body,
        // This is essential, allows cookies to be created through Headers
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

export default AuthAPI;
