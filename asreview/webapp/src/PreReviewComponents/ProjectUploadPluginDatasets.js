import React, { useState, useEffect } from "react";
import { Box, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { PluginDataset } from "../PreReviewComponents";

import ErrorHandler from "../ErrorHandler";
import { ProjectAPI } from "../api/index.js";

const useStyles = makeStyles((theme) => ({
  cards: {
    marginBottom: "20px",
    textAlign: "center",
    margin: 0,
  },
}));

const ProjectUploadPluginDatasets = (props) => {
  const classes = useStyles();

  const [state, setState] = useState({
    datasets: null,
    loaded: false,
  });

  const [error, setError] = useState({
    code: null,
    message: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      const params = {};

      // prepare properties and make subset
      params["subset"] = "plugin";

      ProjectAPI.datasets(params)
        .then((result) => {
          setState({
            datasets: result.data["result"],
            loaded: true,
          });
        })
        .catch((error) => {
          setError({
            code: error.code,
            message: error.message,
          });
        });
    };

    if (!state.loaded && error.message === null) {
      fetchData();
    }
  }, [props.subset, state.loaded, error.message]);

  return (
    <Box className={classes.cards}>
      {state.loaded && error.message === null && (
        <Box>
          {state.datasets.map((dataset) => (
            <PluginDataset
              key={dataset[dataset.length - 1].dataset_id}
              dataset_id={dataset[dataset.length - 1].dataset_id}
              title={dataset[dataset.length - 1].title}
              description={dataset[dataset.length - 1].description}
              img_url={dataset[dataset.length - 1].img_url}
              onUploadHandler={props.onUploadHandler}
            />
          ))}
        </Box>
      )}
      <Box>
        {!state.loaded && error.message === null && <CircularProgress />}
        {error.message !== null && (
          <ErrorHandler error={error} setError={setError} />
        )}
      </Box>
    </Box>
  );
};

export default ProjectUploadPluginDatasets;
