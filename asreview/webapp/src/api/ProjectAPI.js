import { api_url } from '../globals.js';
import axios from 'axios'


class ProjectAPI {

    static finish(project_id) {
        const url = api_url + `project/${project_id}/finish`
        return new Promise(function(resolve, reject) {
            axios.get(url)
                .then((result) => {
                    resolve(result.data)
                })
                .catch((error) => {
                    console.log(error);
                });
        });    
    }

    static info(project_id) {
        const url = api_url + `project/${project_id}/info`
        return new Promise(function(resolve, reject) {
            axios.get(url)
                .then((result) => {
                    resolve(result.data)
                })
                .catch((error) => {
                    console.log(error);
                });
        });    
    }

    static simulate(project_id) {
        const url = api_url + `project/${project_id}/simulate`
        return new Promise(function(resolve, reject) {
            axios.post(url, {}, { headers: {'Content-Type': 'multipart/form-data' }})
                .then((result) => {
                    resolve(result.data)
                })
                .catch((error) => {
                    console.log(error);
                    reject(error)
                });
        });    
    }


    static isSimulationReady(project_id, simulation_id) {
        const url = api_url + `project/${project_id}/simulation/${simulation_id}/ready`;
        return new Promise(function(resolve, reject) {
            axios.get(url)
                .then((result) => {
                    resolve(result.data)
                })
                .catch((error) => {
                    let message = "Unknown error.";

                    if (error.response) {
                        if ('message' in error.response.data){
                            message = error.response.data["message"]
                        }
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    } else if (error.request) {
                        console.log(error.request);
                    } else {
                        console.log('Error', error.message);
                    }
                    reject(message)
                });
        });    
    }

    static markSetupReady(project_id) {
        const url = api_url + `project/${project_id}/setup_ready`
        return new Promise(function(resolve, reject) {
            axios.get(url)
                .then((result) => {
                    resolve(result.data)
                })
                .catch((error) => {
                    console.log(error);
                    reject(error)
                });
        });    
    }


}

export default ProjectAPI