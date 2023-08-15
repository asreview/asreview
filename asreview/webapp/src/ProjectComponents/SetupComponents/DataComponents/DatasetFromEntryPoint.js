import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from "../../../Components";
import { EntryPointDataset } from "../DataComponents";
import { ProjectAPI } from "../../../api/index.js";

import { mapStateToProps } from "../../../globals.js";

const PREFIX = "DatasetFromEntryPoint";

const classes = {
  loading: `${PREFIX}-loading`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.loading}`]: {
    textAlign: "center",
  },
}));

const formatCitation = (authors, year) => {
  if (Array.isArray(authors)) {
    var first_author = authors[0].split(",")[0];
    return first_author + " et al. (" + year + ")";
  } else {
    return authors + " (" + year + ")";
  }
};

const DatasetFromEntryPoint = (props) => {
  const queryClient = useQueryClient();

  const [expanded, setExpanded] = React.useState(false);

  const {
    data,
    error: fetchDatasetsError,
    isError: isFetchDatasetsError,
    isFetched,
    isFetching: isFetchingDatasets,
    isSuccess,
  } = useQuery(
    ["fetchDatasets", { subset: props.subset }],
    ProjectAPI.fetchDatasets,
    { refetchOnWindowFocus: false },
  );

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateData,
    {
      mutationKey: ["addDataset"],
      onSuccess: (data) => {
        props.toggleImportDataset();
        props.toggleProjectSetup();
      },
    },
  );

  const addFile = (dataset_id) => {
    if (props.subset === "plugin") {
      mutate({
        project_id: props.project_id,
        extension: dataset_id,
      });
    } else {
      mutate({
        project_id: props.project_id,
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
      {!isFetchingDatasets && isSuccess && isFetched && (
        <Stack spacing={2}>
          {data?.result.map((group, index) => (
            <Stack spacing={2} key={index}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: (theme) => theme.typography.fontWeightMedium,
                }}
              >
                {group.description}
              </Typography>
              <Box>
                {group.datasets.map((dataset, index) => (
                  <EntryPointDataset
                    addFile={addFile}
                    authors={formatCitation(dataset.authors, dataset.year)}
                    dataset_id={group.group_id + ":" + dataset.dataset_id}
                    description={
                      props.subset === "plugin"
                        ? dataset.description
                        : dataset.topic
                    }
                    doi={
                      dataset.reference &&
                      dataset.reference.replace(/^(https:\/\/doi\.org\/)/, "")
                    }
                    expanded={expanded}
                    isAddingDataset={isLoading}
                    isAddDatasetError={isError}
                    key={group.group_id + ":" + dataset.dataset_id}
                    license={dataset.license}
                    link={dataset.link}
                    location={group.group_id + ":" + dataset.dataset_id}
                    mobileScreen={props.mobileScreen}
                    reset={reset}
                    setExpanded={setExpanded}
                    title={dataset.title}
                  />
                ))}
              </Box>
            </Stack>
          ))}
        </Stack>
      )}
    </Root>
  );
};

export default connect(mapStateToProps, null)(DatasetFromEntryPoint);
