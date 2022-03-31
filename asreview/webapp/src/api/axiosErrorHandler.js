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

export { axiosErrorHandler };
