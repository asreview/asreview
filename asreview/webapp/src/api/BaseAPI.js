import { axiosErrorHandler } from "./axiosErrorHandler";
import axios from "axios";

class BaseAPI {
  static boot = ({ queryKey }) => {
    const url = window.api_url + `boot`;

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
}

export default BaseAPI;
