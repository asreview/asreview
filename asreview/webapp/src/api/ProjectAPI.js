import { axiosErrorHandler } from "./axiosErrorHandler";
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

  static mutateInitProject(variables) {
    let body = new FormData();
    body.set("mode", variables.mode);
    body.set("name", variables.title);
    body.set("authors", variables.authors);
    body.set("description", variables.description);

    const url = api_url + `project/info`;
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

  static fetchInfo({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `project/${project_id}/info`;
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

  static mutateInfo(variables) {
    let body = new FormData();
    body.set("mode", variables.mode);
    body.set("name", variables.title);
    body.set("authors", variables.authors);
    body.set("description", variables.description);

    const url = api_url + `project/${variables.project_id}/info`;
    return new Promise((resolve, reject) => {
      axios({
        method: "put",
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

  static fetchDatasets({ queryKey }) {
    const { subset } = queryKey[1];
    const url = api_url + `datasets`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, {
          params: { subset: subset },
        })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static mutateData(variables) {
    let body = new FormData();
    if (variables.file) {
      body.append("file", variables.file);
    }
    if (variables.url) {
      body.append("url", variables.url);
    }
    if (variables.extension) {
      body.append("plugin", variables.extension);
    }
    if (variables.benchmark) {
      body.append("benchmark", variables.benchmark);
    }

    const url = api_url + `project/${variables.project_id}/data`;
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

  static fetchData({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `project/${project_id}/data`;
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
    const url = api_url + `project/${project_id}/prior`;
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
    const url = api_url + `project/${project_id}/prior`;
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

  static fetchPriorStats({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `project/${project_id}/prior_stats`;
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

  static fetchExportDataset({ queryKey }) {
    const { project_id, fileFormat } = queryKey[1];
    const url =
      api_url + `project/${project_id}/export?file_type=${fileFormat}`;
    return new Promise((resolve, reject) => {
      axios({
        url: url,
        method: "get",
        responseType: "blob",
      })
        .then((result) => {
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            `asreview_result_${project_id}.${fileFormat}`
          );
          document.body.appendChild(link);
          link.click();
          resolve(result);
        })
        .catch((error) => {
          if (
            error.request.responseType === "blob" &&
            error.response.data instanceof Blob &&
            error.response.data.type &&
            error.response.data.type.toLowerCase().indexOf("json") !== -1
          ) {
            let reader = new FileReader();
            reader.onload = () => {
              error.response.data = JSON.parse(reader.result);
              resolve(reject(axiosErrorHandler(error)));
            };
            reader.onerror = () => {
              reject(axiosErrorHandler(error));
            };
            reader.readAsText(error.response.data);
          }
        });
    });
  }

  static fetchExportProject({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `project/${project_id}/export_project`;
    return new Promise((resolve, reject) => {
      axios({
        url: url,
        method: "get",
        responseType: "blob",
      })
        .then((result) => {
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${project_id}.asreview`);
          document.body.appendChild(link);
          link.click();
          resolve(result);
        })
        .catch((error) => {
          if (
            error.request.responseType === "blob" &&
            error.response.data instanceof Blob &&
            error.response.data.type &&
            error.response.data.type.toLowerCase().indexOf("json") !== -1
          ) {
            let reader = new FileReader();
            reader.onload = () => {
              error.response.data = JSON.parse(reader.result);
              resolve(reject(axiosErrorHandler(error)));
            };
            reader.onerror = () => {
              reject(axiosErrorHandler(error));
            };
            reader.readAsText(error.response.data);
          }
        });
    });
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

  static fetchProgress({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `project/${project_id}/progress`;
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

  static fetchProgressDensity({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `project/${project_id}/progress_density`;
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

  static fetchProgressRecall({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `project/${project_id}/progress_recall`;
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

  static mutateClassification(variables) {
    let body = new FormData();
    body.set("doc_id", variables.doc_id);
    if (!variables.initial) {
      body.set("label", variables.label === 1 ? 0 : 1);
    } else {
      body.set("label", variables.label);
    }

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
              variables.label === 1
                ? variables.initial
                  ? "inclusions"
                  : "exclusions"
                : variables.initial
                ? "exclusions"
                : "inclusions"
            }`
          );
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchRecord({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `project/${project_id}/get_document`;
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

  static mutateDeleteProject(variables) {
    const url = api_url + `project/${variables.project_id}/delete`;
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
