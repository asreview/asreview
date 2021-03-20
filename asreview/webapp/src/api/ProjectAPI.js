import { apiErrorHandler } from './index.js';
import { api_url } from '../globals.js';
import axios from 'axios';


class ProjectAPI {

  static projects(setError) {
    const url = api_url + `projects`;
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

  static start(project_id) {
    const url = api_url + `project/${project_id}/start`;
    return new Promise(function(resolve, reject) {
      axios({
        method: 'post',
        url: url,
        data: {},
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
    });
  };

  static init_ready(project_id) {
    const url = api_url + `project/${project_id}/model/init_ready`;
    return new Promise(function(resolve, reject) {
      axios.get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  static import_project(data) {
    const url = api_url + `project/import_project`;
    return new Promise(function(resolve, reject) {
      axios({
        method: 'post',
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

  static export_results(project_id, exportFileType) {
    const exportUrl = api_url + `project/${project_id}/export?file_type=${exportFileType}`
    setTimeout(() => {
      const response = {
        file: exportUrl,
      };
      window.location.href = response.file;
    }, 100);
  };

  static export_project(project_id) {
    const exportUrl = api_url + `project/${project_id}/export_project`
    setTimeout(() => {
      const response = {
        file: exportUrl,
      };
      window.location.href = response.file;
    }, 100);
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

  static progress(project_id) {
    const url = api_url + `project/${project_id}/progress`;
    return new Promise(function(resolve, reject) {
      axios.get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  static progress_history(project_id) {
    const url = api_url + `project/${project_id}/progress_history`;
    return new Promise(function(resolve, reject) {
      axios.get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  static progress_efficiency(project_id) {
    const url = api_url + `project/${project_id}/progress_efficiency`;
    return new Promise(function(resolve, reject) {
      axios.get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  static classify_instance(project_id, doc_id, data) {
    const url = api_url + `project/${project_id}/record/${doc_id}`;
    return new Promise(function(resolve, reject) {
      axios({
        method: 'put',
        url: url,
        data: data,
        headers: { 'Content-Type': 'application/json' }
      })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        console.log(error);
      });
    });
  };

  static delete(project_id) {
    const url = api_url + `project/${project_id}/delete`;
    return new Promise(function(resolve, reject) {
      axios.delete(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.log("Failed to delete project.");
        });
    });
  };

}

export default ProjectAPI
