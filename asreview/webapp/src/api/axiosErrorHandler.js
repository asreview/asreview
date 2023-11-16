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
    console.log(error.request)
    api_error["message"] = "Error, no response received.";
  } else {
    api_error["message"] = "Unexpected error.";
    console.log(error);
  }

  return api_error;
};

export { axiosErrorHandler };
