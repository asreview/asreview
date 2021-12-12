import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

import { BenchmarkDataset } from "../PreReviewComponents";
import ErrorHandler from "../ErrorHandler";
import { ProjectAPI } from "../api/index.js";

const PREFIX = "ProjectUploadBenchmarkDatasets";

const classes = {
  accordion: `${PREFIX}-accordion`,
  title: `${PREFIX}-title`,
  loading: `${PREFIX}-loading`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.accordion}`]: {
    marginBottom: "20px",
    margin: 0,
  },

  [`& .${classes.title}`]: {
    marginTop: "20px",
    marginLeft: "13px",
    marginBottom: "20px",
  },

  [`& .${classes.loading}`]: {
    marginBottom: "20px",
    textAlign: "center",
    margin: 0,
  },
}));

const formatCitation = (authors, year) => {
  if (Array.isArray(authors)) {
    var first_author = authors[0].split(",")[0];
    return first_author + " et al. (" + year + ")";
  } else {
    return authors;
  }
};

const ProjectUploadDatasets = (props) => {
  const [state, setState] = useState({
    groups: null,
    loaded: false,
  });

  const [error, setError] = useState({
    code: null,
    message: null,
  });

  const [expanded, setExpanded] = useState({
    featured: false,
    all: false,
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const params = {};

      // prepare properties and make subset
      params["subset"] = props.subset;

      ProjectAPI.datasets(params)
        .then((result) => {
          setState({
            groups: result.data["result"],
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
    <StyledBox className={classes.accordion}>
      {state.loaded && error.message === null && (
        <Box>
          {state.groups.map((group, index) => (
            <Box>
              <Typography className={classes.title} variant="h6">
                {group.description}
              </Typography>
              <Box>
                {group.datasets.map((dataset, index) => (
                  <BenchmarkDataset
                    index={index}
                    expanded={expanded.all}
                    setExpanded={setExpanded}
                    uploading={uploading}
                    setUploading={setUploading}
                    key={group.group_id + ":" + dataset.dataset_id}
                    dataset_id={group.group_id + ":" + dataset.dataset_id}
                    authors={formatCitation(dataset.authors, dataset.year)}
                    description={dataset.topic}
                    doi={dataset.reference.replace(/^(https:\/\/doi\.org\/)/, "")}
                    title={dataset.title}
                    license={dataset.license}
                    link={dataset.link}
                    location={dataset.url}
                    onUploadHandler={props.onUploadHandler}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
      <Box className={classes.loading}>
        {!state.loaded && error.message === null && <CircularProgress />}
        {error.message !== null && (
          <ErrorHandler error={error} setError={setError} />
        )}
      </Box>
    </StyledBox>
  );
};

export default ProjectUploadDatasets;
