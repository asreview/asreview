import { axiosErrorHandler } from "./axiosErrorHandler";
import { auth_url } from "../globals.js";
import axios from "axios";


class AuthAPI {

  static signup(variables) {
    let body = new FormData();
    body.set("username", variables.username);
    body.set("password", variables.password);

    const url = auth_url + `signup`;
    console.log(url)
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: body
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
          console.log(result);
          resolve(result["data"]);
        })
        .catch((error) => {
          console.log(error);
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
        withCredentials: true
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
