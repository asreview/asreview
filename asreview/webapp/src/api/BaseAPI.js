import { base_url } from "../globals.js";
import axios from "axios";

class BaseAPI {
  static boot = () => {
    const url = base_url + `boot`;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
}

export default BaseAPI;
