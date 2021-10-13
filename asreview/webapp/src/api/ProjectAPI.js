import { axiosErrorHandler } from "./index.js";
import { api_url } from "../globals.js";
import axios from "axios";

class ProjectAPI {
  static fetchProjects({ queryKey }) {
    const url = api_url + `projects`;
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((result) => {
          resolve(result.data["result"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchDashboardStats({ queryKey }) {
    const url = api_url + `projects/stats`;
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((result) => {
          resolve(result.data["result"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static init(data) {
    const url = api_url + `project/info`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: data,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchConvertProjectIfOld({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `project/${project_id}/convert_if_old`;
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
  }

  static info(project_id, edit = false, data = null) {
    const url = api_url + `project/${project_id}/info`;
    return new Promise((resolve, reject) => {
      axios({
        method: edit ? "put" : "get",
        url: url,
        data: data,
      })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static datasets(params) {
    const url = api_url + `datasets`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { params: params })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static data(project_id, edit, data = null) {
    const url = api_url + `project/${project_id}/data`;
    return new Promise((resolve, reject) => {
      axios({
        method: edit ? "post" : "get",
        url: url,
        data: data,
      })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static search(project_id, searchQuery) {
    const url = api_url + `project/${project_id}/search`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { params: { q: searchQuery, n_max: 10 } })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static labelitem(project_id, data) {
    const url = api_url + `project/${project_id}/labelitem`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: data,
        headers: { "Content-type": "application/x-www-form-urlencoded" },
      })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  // TODO{Terry}: deprecating, replaced by fetchLabeledRecord
  static prior(project_id) {
    const url = api_url + `project/${project_id}/labeled`;
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchLabeledRecord({ pageParam = 1, queryKey }) {
    const { project_id, select, per_page } = queryKey[1];
    const url = api_url + `project/${project_id}/labeled`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, {
          params: { subset: select, page: pageParam, per_page: per_page },
        })
        .then((result) => {
          resolve(result.data);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static labeled_stats(project_id) {
    const url = api_url + `project/${project_id}/labeled_stats`;
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static prior_random(project_id) {
    const url = api_url + `project/${project_id}/prior_random`;
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static algorithms_list() {
    const url = api_url + `algorithms`;
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static algorithms(project_id, edit, data = null) {
    const url = api_url + `project/${project_id}/algorithms`;
    return new Promise((resolve, reject) => {
      axios({
        method: edit ? "post" : "get",
        url: url,
        data: data,
      })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static start(project_id) {
    const url = api_url + `project/${project_id}/start`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: {},
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static init_ready(project_id) {
    const url = api_url + `project/${project_id}/ready`;
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static clear_error(project_id) {
    const url = api_url + `project/${project_id}/model/clear_error`;
    return new Promise((resolve, reject) => {
      axios
        .delete(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static mutateImportProject(variables) {
    let body = new FormData();
    body.append("file", variables.file);

    const url = api_url + `project/import_project`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: body,
      })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static export_results(project_id, exportFileType) {
    const exportUrl =
      api_url + `project/${project_id}/export?file_type=${exportFileType}`;
    setTimeout(() => {
      const response = {
        file: exportUrl,
      };
      window.location.href = response.file;
    }, 100);
  }

  static export_project(project_id) {
    const exportUrl = api_url + `project/${project_id}/export_project`;
    setTimeout(() => {
      const response = {
        file: exportUrl,
      };
      window.location.href = response.file;
    }, 100);
  }

  static finish(project_id) {
    const url = api_url + `project/${project_id}/finish`;
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static progress(project_id) {
    const url = api_url + `project/${project_id}/progress`;
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static progress_density(project_id) {
    const url = api_url + `project/${project_id}/progress_density`;
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static progress_recall(project_id) {
    const url = api_url + `project/${project_id}/progress_recall`;
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  // TODO{Terry}: deprecating, will be replaced by mutateClassification()
  static classify_instance(project_id, doc_id, data, initial) {
    const url = api_url + `project/${project_id}/record/${doc_id}`;
    return new Promise((resolve, reject) => {
      axios({
        method: initial ? "post" : "put",
        url: url,
        data: data,
        headers: { "Content-Type": "application/json" },
      })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static mutateClassification(variables) {
    let body = new FormData();
    body.set("doc_id", variables.doc_id);
    body.set("label", variables.label === 1 ? 0 : 1);

    const url =
      api_url + `project/${variables.project_id}/record/${variables.doc_id}`;
    return new Promise((resolve, reject) => {
      axios({
        method: variables.initial ? "post" : "put",
        url: url,
        data: body,
        headers: { "Content-Type": "application/json" },
      })
        .then((result) => {
          resolve(result);
          console.log(
            `${variables.project_id} - add item ${variables.doc_id} to ${
              variables.label === 1 ? "exclusions" : "inclusions"
            }`
          );
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static get_document(project_id) {
    const url = api_url + `project/${project_id}/get_document`;
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static delete(project_id) {
    const url = api_url + `project/${project_id}/delete`;
    return new Promise((resolve, reject) => {
      axios
        .delete(url)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }
}

export default ProjectAPI;
