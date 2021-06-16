import { api_url } from "../globals.js";
import axios from "axios";

import AddUser from "../Components/AddUser";

// TODO: Duplicate to put out
const axiosErrorHandler = (error) => {
    let api_error = {};

    if (error.response) {
        if (error.response.data["message"]) {
            api_error["code"] = error.response["status"];
            api_error["message"] = error.response.data["message"];
        } else {
            api_error["code"] = 500;
            api_error["message"] = "Whoops, something went wrong.";
        }
    } else if (error.request) {
        api_error["code"] = 503;
        api_error["message"] =
            "Failed to connect to server. Please restart the software.";
    } else {
        api_error["message"] = "Unexpected error.";
        console.log(error);
    }

    return api_error;
};


class UsersAPI {

    // Utils
    createMessage = (type, text) => {
        this.setState({
            messageType: type,
            messageText: text,
        });
        setTimeout(() => {
            this.removeMessage();
        }, 3000);
    };

    removeMessage = () => {
        this.setState({
            messageType: null,
            messageText: null,
        });
    };

    // Users
    componentDidMount = () => {
        this.getUsers();
    };

    addUser = (data) => {
        const url = api_url + `users`;
        axios
            .post(url, data)
            .then((res) => {
                this.getUsers();
                this.setState({ username: "", email: "" });
                this.handleCloseModal();
                this.createMessage("success", "User added.");
            })
            .catch((err) => {
                console.log(err);
                //reject(axiosErrorHandler(err));
                this.handleCloseModal();
                this.createMessage("danger", "User already exists.");
            });
    };

    getUsers = () => {
        const url = api_url + `users`;
        axios
            .get(url)
            .then((res) => {
                this.setState({ users: res.data });
            })
            .catch((err) => {
                console.log(err);
                //reject(axiosErrorHandler(err));
            });
    };

    // Auth
    isAuthenticated = () => {
        if (this.state.accessToken || this.validRefresh()) {
            return true;
        }
        return false;
    };

    logoutUser = () => {
        window.localStorage.removeItem("refreshToken");
        this.setState({ accessToken: null });
        this.createMessage("success", "You have logged out.");
    };

    // path to auth/refresh can be added like this or not?
    validRefresh = () => {
        const token = window.localStorage.getItem("refreshToken");
        if (token) {
            const url = api_url + `auth/refresh`;
            axios
                .post(url, {
                    refresh_token: token,
                })
                .then((res) => {
                    this.setState({ accessToken: res.data.access_token });
                    this.getUsers();
                    window.localStorage.setItem("refreshToken", res.data.refresh_token);
                    return true;
                })
                .catch((err) => {
                    return false;
                    //reject(axiosErrorHandler(err));
                });
        }
        return false;
    };

    handleLoginFormSubmit = (data) => {
        const url = api_url + `/auth/login`;
        axios
            .post(url, data)
            .then((res) => {
                this.setState({ accessToken: res.data.access_token });
                this.getUsers();
                window.localStorage.setItem("refreshToken", res.data.refresh_token);
                this.createMessage("success", "You have logged in successfully.");
            })
            .catch((err) => {
                console.log(err);
                this.createMessage("danger", "Incorrect email and/or password.");
                //reject(axiosErrorHandler(err));
            });
    };

    handleRegisterFormSubmit = (data) => {
        const url = api_url + `/auth/register`;
        axios
            .post(url, data)
            .then((res) => {
                console.log(res.data);
                this.createMessage("success", "You have registered successfully.");
            })
            .catch((err) => {
                console.log(err);
                this.createMessage("danger", "That user already exists.");
                //reject(axiosErrorHandler(err));
            });
    };

    removeUser = (user_id) => {
        const url = api_url + `users/${user_id}`;
        axios
            .delete(url)
            .then((res) => {
                this.getUsers();
                this.createMessage("success", "User removed.");
            })
            .catch((err) => {
                console.log(err);
                this.createMessage("danger", "Something went wrong.");
                //reject(axiosErrorHandler(err));
            });
    };
};

export default UsersAPI;