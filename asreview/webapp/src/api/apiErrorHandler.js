class apiErrorHandler {

  static withRetry(error, setError) {
    
    if (error.response) {
      setError({
        message: error.response.data.message,
        retry: true,
      });
      console.log(error.response);
    } else {
      setError(s => {return({
        ...s,
        message: "Failed to connect to server. Please restart the software.",
      })});
    };

  };

};

export default apiErrorHandler
