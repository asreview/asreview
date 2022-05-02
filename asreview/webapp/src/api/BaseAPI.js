import { axiosErrorHandler } from "./axiosErrorHandler";
import { base_url } from "../globals.js";
import axios from "axios";

class BaseAPI {
  static boot = ({ queryKey }) => {
    const url = base_url + `boot`;
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  };

  static signup(variables) {
    let body = new FormData();
    body.set("username", variables.username);
    body.set("password", variables.password);

    const url = base_url + `signup`;
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
    body.set("username", variables.username);
    body.set("password", variables.password);

    const url = base_url + `signin`;
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

  static signout(variables) {
    const url = base_url + `signout`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
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

export default BaseAPI;
