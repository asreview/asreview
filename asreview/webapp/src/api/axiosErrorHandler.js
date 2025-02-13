const axiosErrorHandler = (error) => {
  let api_error = {};

  if (error.response) {
    api_error["code"] = error.response.status;

    if (error.response.data?.message) {
      api_error["message"] = error.response.data.message;
    } else {
      api_error["message"] = "Whoops, something went wrong.";
    }
  } else if (error.request) {
    // This branch executes when the request was made but no response received
    // Typical scenarios: no internet connection, server down, etc.
    console.log(error.request);
    // Check if the failed request was to localhost
    const isLocalhost =
      error.config?.url?.includes("localhost") ||
      error.config?.url?.includes("127.0.0.1");

    api_error["message"] = isLocalhost
      ? "Cannot connect to the local server. Please check if the ASReview terminal is still running."
      : "Cannot connect to the server. Please check your internet connection.";
  } else {
    api_error["message"] = "Unexpected error.";
    console.log(error);
  }

  return api_error;
};

export { axiosErrorHandler };
