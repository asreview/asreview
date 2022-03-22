import React from "react";
import { useQuery, useQueryClient } from "react-query";
import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import StarIcon from "@mui/icons-material/Star";

import { InlineErrorHandler } from "../../../Components";
import { BenchmarkDataset } from "../DataComponents";
import { ProjectAPI } from "../../../api/index.js";

const PREFIX = "DatasetFromBenchmark";

const classes = {
  loading: `${PREFIX}-loading`,
  featuredTitle: `${PREFIX}-featured-title`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.loading}`]: {
    textAlign: "center",
  },

  [`& .${classes.featuredTitle}`]: {
    alignItems: "center",
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

  const [expanded, setExpanded] = React.useState({
    featured: false,
    other: false,
  });

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
      return props.addDatasetError?.message + " Please try again";
    }
  };

  return (
    <Root>
      {isFetchingDatasets && (
        <Box className={classes.loading}>
          <CircularProgress />
        </Box>
      )}
      {(isFetchDatasetsError || props.isAddDatasetError) && (
        <InlineErrorHandler
          message={returnError()}
          refetch={refetchDatasets}
          button={!props.isAddDatasetError}
        />
      )}
      {!isFetchingDatasets && isSuccess && isFetched && (
        <Stack spacing={5}>
          <Stack spacing={1}>
            <Stack
              direction="row"
              spacing={1}
              className={classes.featuredTitle}
            >
              <StarIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" sx={{ color: "primary.main" }}>
                <b>Featured</b>
              </Typography>
            </Stack>
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
          <Divider />
          <Box>
            {data?.result
              .filter(function (dataset) {
                return !dataset.featured;
              })
              .map((dataset, index) => (
                <BenchmarkDataset
                  authors={formatCitation(dataset.authors, dataset.year)}
                  benchmark={props.benchmark}
                  dataset_id={dataset.dataset_id}
                  description={dataset.topic}
                  doi={dataset.reference.replace(/^(https:\/\/doi\.org\/)/, "")}
                  expanded={expanded.other}
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
      )}
    </Root>
  );
};

export default DatasetFromBenchmark;
