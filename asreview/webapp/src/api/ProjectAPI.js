import { apiErrorHandler } from './index.js';
import { api_url } from '../globals.js';
import axios from 'axios';


class ProjectAPI {

  static init(data, setError) {
    const url = api_url + `project/info`;
    return new Promise(function(resolve, reject) {
      axios({
        method: 'post',
        url: url,
        data: data,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        apiErrorHandler.withoutRetry(reject, error, setError);
      });
    });
  };

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

  static datasets(params, setError) {
    const url = api_url + `datasets`;
    return new Promise(function(resolve, reject) {
      axios.get(
        url,
        { params: params }
      )
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        apiErrorHandler.withRetry(error, setError);
      });
    });
  };

  static data(project_id, edit, data=null) {
    const url = api_url + `project/${project_id}/data`;
    return new Promise(function(resolve, reject) {
      axios({
        method: edit ? 'post' : 'get',
        url: url,
        data: data,
      })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
    });
  };

  static search(project_id, searchQuery, setError) {
    const url = api_url + `project/${project_id}/search`;
    return new Promise(function(resolve, reject) {
      axios.get(
        url,
        { params:
            { q: searchQuery,
              n_max: 10,
            }
        },
      )
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

  static algorithms(project_id, edit, data=null) {
    const url = api_url + `project/${project_id}/algorithms`;
    return new Promise(function(resolve, reject) {
      axios({
        method: edit ? 'post' : 'get',
        url: url,
        data: data,
      })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        console.log(error);
      });
    });
  };

  static labelitem(project_id, data) {
    const url = api_url + `project/${project_id}/labelitem`;
    return new Promise(function(resolve, reject) {
      axios({
        method: 'post',
        url: url,
        data: data,
        headers: { 'Content-type': 'application/x-www-form-urlencoded' }
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
