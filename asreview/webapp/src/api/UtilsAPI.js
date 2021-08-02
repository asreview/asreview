import { axiosErrorHandler } from "./index.js";
import { api_url } from "../globals.js";
import axios from "axios";

class UtilsAPI {
  static faq = () => {
    const url = api_url + `faq`;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  };
}

export default UtilsAPI;
