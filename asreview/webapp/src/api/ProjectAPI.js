import { apiErrorHandler } from './index.js';
import { api_url } from '../globals.js';
import axios from 'axios';


class ProjectAPI {

  static info(project_id, setError) {
    const url = api_url + `project/${project_id}/info`;
    return new Promise(function(resolve, reject) {
      axios.get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          apiErrorHandler.withRetry(error, setError);
        });
    });
  };

  static prior(project_id, setError) {
    const url = api_url + `project/${project_id}/prior`;
    return new Promise(function(resolve, reject) {
      axios.get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          apiErrorHandler.withRetry(error, setError);
        });
    });
  }

  static finish(project_id) {
    const url = api_url + `project/${project_id}/finish`;
    return new Promise(function(resolve, reject) {
      axios.get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  };

}

export default ProjectAPI
