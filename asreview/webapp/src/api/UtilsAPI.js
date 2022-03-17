import { axiosErrorHandler } from "./axiosErrorHandler";
import axios from "axios";

class UtilsAPI {
  static fetchFAQ = ({ queryKey }) => {
    const url =
      "https://raw.githubusercontent.com/asreview/asreview/master/asreview/webapp/help.json";
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((result) => {
          resolve(result.data.resources.faq["items"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  };
}

export default UtilsAPI;
