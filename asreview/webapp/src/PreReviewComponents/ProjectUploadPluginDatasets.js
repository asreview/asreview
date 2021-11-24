import React, { useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

import { PluginDataset } from "../PreReviewComponents";
import ErrorHandler from "../ErrorHandler";
import { ProjectAPI } from "../api/index.js";

const PREFIX = "ProjectUploadPluginDatasets";

const classes = {
  cards: `${PREFIX}-cards`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.cards}`]: {
    marginBottom: "20px",
    textAlign: "center",
    margin: 0,
  },
}));

const ProjectUploadPluginDatasets = (props) => {
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
    <StyledBox className={classes.cards}>
      {state.loaded && error.message === null && (
        <Box>
          {state.datasets.map((dataset) => (
            <PluginDataset
              dataset={dataset}
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
    </StyledBox>
  );
};

export default ProjectUploadPluginDatasets;
