import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { Box, CircularProgress, Stack, Typography, Link } from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from "Components";
import { EntryPointDataset } from ".";
import { ProjectAPI } from "api";

const PREFIX = "DatasetFromEntryPoint";

const classes = {
  loading: `${PREFIX}-loading`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.loading}`]: {
    textAlign: "center",
  },
}));

const DatasetFromEntryPoint = ({
  subset,
  mobileScreen,
  setDataset,
  mode,
  datasetSource,
}) => {
  const queryClient = useQueryClient();

  const {
    data,
    error: fetchDatasetsError,
    isError: isFetchDatasetsError,
    isFetched,
    isFetching: isFetchingDatasets,
    isSuccess,
  } = useQuery(
    ["fetchDatasets", { subset: subset }],
    ProjectAPI.fetchDatasets,
    { refetchOnWindowFocus: false },
  );

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.createProject,
    {
      mutationKey: ["addDataset"],
      onSuccess: (data) => {
        setDataset(data);
      },
    },
  );

  const addFile = (dataset_id) => {
    if (subset === "plugin") {
      mutate({
        mode: mode,
        extension: dataset_id,
      });
    } else {
      mutate({
        mode: mode,
        benchmark: dataset_id,
      });
    }
  };

  const refetchDatasets = () => {
    queryClient.resetQueries("fetchDatasets");
  };

  const returnError = () => {
    if (isFetchDatasetsError) {
      return fetchDatasetsError?.message;
    }
    if (isError) {
      return error?.message + " Please try again";
    }
  };

  return (
    <Root>
      {datasetSource === "extension" && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Select a dataset from an extension.{" "}
          <Link
            underline="none"
            href="https://asreview.readthedocs.io/en/latest/extensions_dev.html"
            target="_blank"
          >
            Learn more
          </Link>
        </Typography>
      )}
      {datasetSource === "benchmark" && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          The benchmark datasets were manually labeled and can be used to
          explore or demonstrate ASReview LAB. You can donate your dataset to
          the benchmark platform.{" "}
          <Link
            underline="none"
            href="https://github.com/asreview/synergy-dataset"
            target="_blank"
          >
            Learn more
          </Link>
        </Typography>
      )}
      {isFetchingDatasets && (
        <Box className={classes.loading}>
          <CircularProgress />
        </Box>
      )}
      {(isFetchDatasetsError || isError) && (
        <InlineErrorHandler
          message={returnError()}
          refetch={refetchDatasets}
          button={!isError}
        />
      )}
      {isSuccess && isFetched && data["result"]?.length === 0 && (
        <Typography>No dataset extensions installed.</Typography>
      )}
      {data && (
        <Stack spacing={2}>
          {data?.result.map((group, index) => (
            <Stack spacing={2} key={index}>
              <Typography
                variant="subtitle1"
                sx={(theme) => ({
                  fontWeight: theme.typography.fontWeightMedium,
                })}
              >
                {group.description}
              </Typography>
              <Box>
                {group.datasets.map((dataset, index) => (
                  <EntryPointDataset
                    addFile={addFile}
                    dataset={dataset}
                    dataset_id={group.group_id + ":" + dataset.dataset_id}
                    subset={subset}
                    isAddingDataset={isLoading}
                    isAddingDatasetError={isError}
                    mobileScreen={mobileScreen}
                    reset={reset}
                    key={group.group_id + ":" + dataset.dataset_id}
                  />
                ))}
              </Box>
            </Stack>
          ))}
        </Stack>
        // )};
      )}
    </Root>
  );
};

export default DatasetFromEntryPoint;
