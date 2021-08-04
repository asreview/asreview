import { axiosErrorHandler } from "./index.js";
import { api_url } from "../globals.js";
import axios from "axios";

class UtilsAPI {
  static faq = () => {
    const url = "https://raw.githubusercontent.com/asreview/asreview/master/asreview/webapp/faq.json";
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((result) => {
          resolve(result.data["items"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  };
}

export default UtilsAPI;
