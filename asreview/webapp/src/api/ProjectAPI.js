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
  };

  static prior_stats(project_id) {
    const url = api_url + `project/${project_id}/prior_stats`;
    return new Promise(function(resolve, reject) {
      axios.get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.log("Failed to load prior information");
        });
    });
  };

  static prior_random(project_id, setError) {
    const url = api_url + `project/${project_id}/prior_random`;
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

  static labelitem(project_id, body) {
    const url = api_url + `project/${project_id}/labelitem`;
    return new Promise(function(resolve, reject) {
      axios.post(
        url,
        body,
        {
          headers: {
            'Content-type': 'application/x-www-form-urlencoded',
          }
        })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        console.log(error);
      });
    });
  };

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
