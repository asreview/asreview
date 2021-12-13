import React from "react";
import { useQuery, useQueryClient } from "react-query";
import { Box, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from "../../../Components";
import { EntryPointDataset } from "../DataComponents";
import { ProjectAPI } from "../../../api/index.js";

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
    return authors;
  }
};

const DatasetFromEntryPoint = (props) => {
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
    ["fetchDatasets", { subset: props.subset }],
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
        <Box sx={{ mt: 2 }}>
          {data?.result.map((group, index) => (
            <Box key={index}>
              {group.datasets.map((dataset, index) => (
                <EntryPointDataset
                  authors={formatCitation(dataset.authors, dataset.year)}
                  dataset_id={group.group_id + ":" + dataset.dataset_id}
                  description={dataset.topic}
                  doi={
                    dataset.reference &&
                    dataset.reference.replace(/^(https:\/\/doi\.org\/)/, "")
                  }
                  expanded={expanded.other}
                  index={index}
                  isAddingDataset={props.isAddingDataset}
                  isAddDatasetError={props.isAddDatasetError}
                  key={group.group_id + ":" + dataset.dataset_id}
                  license={dataset.license}
                  link={dataset.link}
                  location={dataset.url}
                  reset={props.reset}
                  selectedDatasetId={
                    props.subset === "plugin"
                      ? props.extension
                      : props.benchmark
                  }
                  setExpanded={setExpanded}
                  setSelectedDatasetId={
                    props.subset === "plugin"
                      ? props.setExtension
                      : props.setBenchmark
                  }
                  title={dataset.title}
                />
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Root>
  );
};

export default DatasetFromEntryPoint;
