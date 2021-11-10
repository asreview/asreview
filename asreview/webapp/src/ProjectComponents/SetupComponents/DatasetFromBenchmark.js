import React from "react";
import { useQuery, useQueryClient } from "react-query";
import { Box, Stack, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

import { BenchmarkDataset } from "../SetupComponents";
import { ProjectAPI } from "../../api/index.js";

const PREFIX = "DatasetFromBenchmark";

const classes = {
  accordion: `${PREFIX}-accordion`,
  title: `${PREFIX}-title`,
  loading: `${PREFIX}-loading`,
};

const Root = styled("div")(({ theme }) => ({
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

const DatasetFromBenchmark = (props) => {
  const queryClient = useQueryClient();

  const {
    data,
    error: fetchDatasetsError,
    isError: isFetchDatasetsError,
    isFetched,
    isFetching: isFetchingDatasets,
    isSuccess,
  } = useQuery(
    ["fetchDatasets", { subset: "benchmark" }],
    ProjectAPI.fetchDatasets,
    { refetchOnWindowFocus: false }
  );

  const refetchDatasets = () => {
    queryClient.resetQueries("fetchDatasets");
  };

  const returnError = () => {
    if (isFetchDatasetsError) {
      return fetchDatasetsError?.message;
    }
    if (props.isAddDatasetError) {
      return props.addDatasetError?.message;
    }
  };

  const [expanded, setExpanded] = React.useState({
    featured: false,
    all: false,
  });

  return (
    <Root>
      {isFetchingDatasets && (
        <Box className={classes.loading}>
          <CircularProgress />
        </Box>
      )}
      {!isFetchingDatasets && isSuccess && isFetched && (
        <Stack spacing={3}>
          <Stack spacing={3}>
            <Typography variant="h6">Featured benchmark datasets</Typography>
            <Box>
              {data?.result
                .filter(function (dataset) {
                  return dataset.featured;
                })
                .map((dataset, index, array) => (
                  <BenchmarkDataset
                    authors={formatCitation(
                      array[array.length - 1 - index].authors,
                      array[array.length - 1 - index].year
                    )}
                    benchmark={props.benchmark}
                    dataset_id={array[array.length - 1 - index].dataset_id}
                    description={array[array.length - 1 - index].topic}
                    doi={array[array.length - 1 - index].reference.replace(
                      /^(https:\/\/doi\.org\/)/,
                      ""
                    )}
                    expanded={expanded.featured}
                    featured={dataset.featured}
                    index={index}
                    isAddingDataset={props.isAddingDataset}
                    isAddDatasetError={props.isAddDatasetError}
                    key={array[array.length - 1 - index].dataset_id}
                    license={array[array.length - 1 - index].license}
                    link={array[array.length - 1 - index].link}
                    location={array[array.length - 1 - index].url}
                    reset={props.reset}
                    setBenchmark={props.setBenchmark}
                    setExpanded={setExpanded}
                    title={array[array.length - 1 - index].title}
                  />
                ))}
            </Box>
          </Stack>
          <Stack spacing={3}>
            <Typography variant="h6">All benchmark datasets</Typography>
            <Box>
              {data?.result.map((dataset, index) => (
                <BenchmarkDataset
                  authors={formatCitation(dataset.authors, dataset.year)}
                  benchmark={props.benchmark}
                  dataset_id={dataset.dataset_id}
                  description={dataset.topic}
                  doi={dataset.reference.replace(/^(https:\/\/doi\.org\/)/, "")}
                  expanded={expanded.all}
                  index={index}
                  isAddingDataset={props.isAddingDataset}
                  isAddDatasetError={props.isAddDatasetError}
                  key={dataset.dataset_id}
                  license={dataset.license}
                  link={dataset.link}
                  location={dataset.url}
                  reset={props.reset}
                  setBenchmark={props.setBenchmark}
                  setExpanded={setExpanded}
                  title={dataset.title}
                />
              ))}
            </Box>
          </Stack>
        </Stack>
      )}
    </Root>
  );
};

export default DatasetFromBenchmark;
