import axios from "axios";
import { api_url } from "globals.js";
import qs from "qs";
import { axiosErrorHandler } from "./axiosErrorHandler";

class ProjectAPI {
  static fetchProjects({ queryKey }) {
    const { subset } = queryKey[1];
    const url = api_url + `projects`;
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

  static mutateInitProject(variables) {
    let body = new FormData();
    body.set("mode", variables.mode);

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

  static createProject(variables) {
    let body = new FormData();
    body.set("mode", variables.mode);

    if (variables.file) {
      body.append("file", variables.file);
    }
    if (variables.url) {
      body.append("url", variables.url);
      if (variables.filename) {
        body.append("filename", variables.filename);
      }
    }
    if (variables.extension) {
      body.append("plugin", variables.extension);
    }
    if (variables.benchmark) {
      body.append("benchmark", variables.benchmark);
    }

    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: api_url + `projects/create`,
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

  static mutateUpgradeProjects() {
    const url = api_url + `upgrade/projects`;
    return new Promise((resolve, reject) => {
      axios({
        method: "put",
        url: url,
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

  static fetchWordCounts({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `projects/${project_id}/wordcounts`;
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

  static fetchTraining({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `projects/${project_id}/training`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { withCredentials: true })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static mutateInfo(variables) {
    let body = new FormData();

    if (variables.title !== undefined) {
      body.set("name", variables.title);
    }

    if (variables.authors !== undefined) {
      body.set("authors", variables.authors);
    }
    if (variables.description !== undefined) {
      body.set("description", variables.description);
    }

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

  static resolveURI({ uri }) {
    const resolve_uri = api_url + `resolve_uri?uri=${uri}`;
    return new Promise((resolve, reject) => {
      axios
        .get(resolve_uri, { withCredentials: true })
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

  static fetchLabeledRecord({ pageParam = 1, queryKey }) {
    const { project_id, subset, filter } = queryKey[1];

    const url = api_url + `projects/${project_id}/labeled`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, {
          params: { subset: subset, filter: filter, page: pageParam },
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

  static fetchLearners({ queryKey }) {
    const url = api_url + `learners`;
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

  static fetchLearner({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `projects/${project_id}/learner`;
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

  static mutateLearner(variables) {
    let body = new FormData();
    body.set("name", variables.name);
    body.set("current_value", JSON.stringify(variables.current_value));

    const url = api_url + `projects/${variables.project_id}/learner`;
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

  static mutateTraining(variables) {
    const url = api_url + `projects/${variables.project_id}/train`;

    let data = new FormData();
    data.set("ranking", variables.ranking);

    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url: url,
        data: data,
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

  static mutateReviewStatus(variables) {
    let body = new FormData();
    body.set("status", variables.status);
    body.set("trigger_model", variables.trigger_model);

    const url = api_url + `projects/${variables.project_id}/reviews/0`;
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

  static mutateImportProject(variables) {
    let body = new FormData();
    body.append("file", variables.file);

    const url = api_url + `projects/import`;
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

  static fetchExportDataset({
    project_id,
    collections,
    format,
    exportName,
    exportEmail,
  }) {
    const url = api_url + `projects/${project_id}/export_dataset`;

    return new Promise((resolve, reject) => {
      axios({
        url: url,
        method: "get",
        params: {
          collections: collections,
          format: format,
          export_name: exportName ? 1 : 0,
          export_email: exportEmail ? 1 : 0,
        },
        paramsSerializer: (params) => {
          return qs.stringify(params, { arrayFormat: "repeat" });
        },
        responseType: "blob",
        withCredentials: true,
      })
        .then((result) => {
          const filename =
            result.headers["content-disposition"].split("filename=")[1];
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          resolve(result);
        })
        .catch((error) => {
          console.log(error);
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
          const project_title = result.headers["content-disposition"]
            .split("filename=")[1]
            .split(".")[0];

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
    const { project_id, includePrior } = queryKey[1];
    const url = api_url + `projects/${project_id}/progress`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { params: { priors: includePrior }, withCredentials: true })
        .then((result) => {
          resolve(result["data"]);
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static fetchStopping({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `projects/${project_id}/stopping`;
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

  static mutateStopping(variables) {
    let body = new FormData();
    body.set("n", variables.n);

    const url = api_url + `projects/${variables.project_id}/stopping`;
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
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

  static fetchTagGroups({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `projects/${project_id}/tags`;
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

  static createTagGroup(variables) {
    let body = new FormData();
    body.set("group", JSON.stringify(variables.group));

    const url = api_url + `projects/${variables.project_id}/tags`;
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

  static mutateTagGroup(variables) {
    let body = new FormData();
    body.set("group", JSON.stringify(variables.group));

    const url =
      api_url + `projects/${variables.project_id}/tags/${variables.group.id}`;
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

  static fetchGenericData({ queryKey }) {
    const { project_id, includePrior } = queryKey[1];
    const url = api_url + `projects/${project_id}/progress_data`;
    return new Promise((resolve, reject) => {
      axios
        .get(url, { params: { priors: includePrior }, withCredentials: true })
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
    body.set("record_id", variables.record_id);
    body.set("label", variables.label);

    if (variables.tagValues && Array.isArray(variables.tagValues)) {
      body.set("tags", JSON.stringify(variables.tagValues));
    }

    if (variables.retrain_model) {
      body.set("retrain_model", 1);
    }
    const url =
      api_url +
      `projects/${variables.project_id}/record/${variables.record_id}`;
    return new Promise((resolve, reject) => {
      axios({
        method: variables.initial ? "post" : "put",
        url: url,
        data: body,
        withCredentials: true,
      })
        .then((result) => {
          if (result.config.method === "post") {
            console.log(
              `${variables.project_id} - initial classification ${
                variables.record_id
              } as ${variables.label === 1 ? "inclusion" : "exclusion"}`,
            );
            resolve(result);
          } else {
            // console.log(
            //   `${variables.project_id} - update classification ${
            //     variables.record_id
            //   } as ${variables.label === 1 ? "inclusion" : "exclusion"}`,
            // );
            resolve(result["data"]);
          }
        })
        .catch((error) => {
          reject(axiosErrorHandler(error));
        });
    });
  }

  static mutateNote(variables) {
    let body = new FormData();
    body.set("record_id", variables.record_id);
    body.set("note", variables.note);

    const url =
      api_url +
      `projects/${variables.project_id}/record/${variables.record_id}/note`;

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

  static fetchRecord({ queryKey }) {
    const { project_id } = queryKey[1];
    const url = api_url + `projects/${project_id}/get_record`;
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
