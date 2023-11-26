import { axiosErrorHandler } from "./axiosErrorHandler";
import { api_url } from "../globals.js";
import axios from "axios";
import qs from "qs";

class ProjectAPI {
  static fetchProjects({ queryKey }) {
    const url = api_url + `projects`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { withCredentials: true })
        .then((result) => {
          resolve(result["data"]);
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
        .get(url, { withCredentials: true })
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

    const url = api_url + `projects/info`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: body,
        withCredentials: true,
      })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchUpgradeProjectIfOld({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `projects/${project_id}/upgrade_if_old`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { withCredentials: true })
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
    const url = api_url + `projects/${project_id}/info`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { withCredentials: true })
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

    const url = api_url + `projects/${variables.project_id}/info`;
    return new Promise((resolve, reject) => {
      axios({
        method: "put",
        url: url,
        data: body,
        withCredentials: true,
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
          withCredentials: true,
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
      if (variables.validate) {
        body.append("validate", variables.validate);
      }
    }
    if (variables.extension) {
      body.append("plugin", variables.extension);
    }
    if (variables.benchmark) {
      body.append("benchmark", variables.benchmark);
    }

    const url = api_url + `projects/${variables.project_id}/data`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: body,
        withCredentials: true,
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
    const url = api_url + `projects/${project_id}/data`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { withCredentials: true })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchDatasetReaders({ queryKey }) {
    const url = api_url + `dataset_readers`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { withCredentials: true })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchDatasetWriter({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `projects/${project_id}/dataset_writer`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { withCredentials: true })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchPriorSearch({ queryKey }) {
    const { project_id, keyword } = queryKey[1];
    const url = api_url + `projects/${project_id}/search`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, {
          params: { q: keyword, n_max: 10 },
          withCredentials: true,
        })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchPriorRandom({ queryKey }) {
    const { project_id, n, subset } = queryKey[1];
    const url = api_url + `projects/${project_id}/prior_random`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, {
          params: { n: n, subset: subset },
          withCredentials: true,
        })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchLabeledRecord({ pageParam = 1, queryKey }) {
    const { project_id, subset, per_page } = queryKey[1];
    const url = api_url + `projects/${project_id}/labeled`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, {
          params: { subset: subset, page: pageParam, per_page: per_page },
          paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: "repeat" });
          },
          withCredentials: true,
        })
        .then((result) => {
          resolve(result.data);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchLabeledStats({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `projects/${project_id}/labeled_stats`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { withCredentials: true })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchModelOptions({ queryKey }) {
    const url = api_url + `algorithms`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { withCredentials: true })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchModelConfig({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `projects/${project_id}/algorithms`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { withCredentials: true })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static mutateModelConfig(variables) {
    let body = new FormData();
    body.set("model", variables.classifier);
    body.set("query_strategy", variables.query_strategy);
    body.set("balance_strategy", variables.balance_strategy);
    body.set("feature_extraction", variables.feature_extraction);

    const url = api_url + `projects/${variables.project_id}/algorithms`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: body,
        withCredentials: true,
      })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static mutateStartTraining(variables) {
    const url = api_url + `projects/${variables.project_id}/start`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: {},
        withCredentials: true,
        // headers: { "Content-Type": "multipart/form-data" },
      })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchProjectStatus({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `projects/${project_id}/status`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { withCredentials: true })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static mutateProjectStatus(variables) {
    let body = new FormData();
    body.set("status", variables.status);

    const url = api_url + `projects/${variables.project_id}/status`;
    return new Promise((resolve, reject) => {
      axios({
        method: "put",
        url: url,
        data: body,
        withCredentials: true,
      })
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

    const url = api_url + `projects/import_project`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: body,
        withCredentials: true,
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
    const { project_id, project_title, datasetLabel, fileFormat } = queryKey[1];
    const url =
      api_url +
      `projects/${project_id}/export_dataset?dataset_label=${datasetLabel}&file_format=${fileFormat}`;
    return new Promise((resolve, reject) => {
      axios({
        url: url,
        method: "get",
        responseType: "blob",
        withCredentials: true,
      })
        .then((result) => {
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            `asreview_dataset_${datasetLabel}_${project_title}.${fileFormat}`,
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
    const { project_id, project_title } = queryKey[1];
    const url = api_url + `projects/${project_id}/export_project`;
    return new Promise((resolve, reject) => {
      axios({
        url: url,
        method: "get",
        responseType: "blob",
        withCredentials: true,
      })
        .then((result) => {
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${project_title}.asreview`);
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

  static fetchProgress({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `projects/${project_id}/progress`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { withCredentials: true })
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
    const url = api_url + `projects/${project_id}/progress_density`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { withCredentials: true })
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
    const url = api_url + `projects/${project_id}/progress_recall`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { withCredentials: true })
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
    body.set("label", variables.label);
    body.set("note", variables.note);

    // prior items should be labeled as such
    if (variables.is_prior === 1) {
      body.set("is_prior", 1);
    }
    const url =
      api_url + `projects/${variables.project_id}/record/${variables.doc_id}`;
    return new Promise((resolve, reject) => {
      axios({
        method: variables.initial ? "post" : "put",
        url: url,
        data: body,
        // headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })
        .then((result) => {
          resolve(result);
          console.log(
            `${variables.project_id} - add item ${variables.doc_id} to ${
              variables.label === 1 ? "inclusions" : "exclusions"
            }`,
          );
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchRecord({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `projects/${project_id}/get_document`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { withCredentials: true })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static mutateDeleteProject(variables) {
    const url = api_url + `projects/${variables.project_id}/delete`;
    return new Promise((resolve, reject) => {
      axios
        .delete(url, { withCredentials: true })
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
