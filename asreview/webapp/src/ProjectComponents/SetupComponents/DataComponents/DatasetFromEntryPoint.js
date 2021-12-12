import React from "react";
import { useQuery, useQueryClient } from "react-query";
import {
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from "../../../Components";
import { BenchmarkDataset } from "../DataComponents";
import { ProjectAPI } from "../../../api/index.js";

const PREFIX = "DatasetFromEntryPoint";

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

          <Box>
            {data?.result.map((group, index) => (
              <Box>
                <Typography className={classes.title} variant="h6">
                  {group.description}
                </Typography>
                <Box>
                  {group.datasets.map((dataset, index) => (
                    <BenchmarkDataset
                      index={index}
                      expanded={expanded.other}
                      setExpanded={setExpanded}
                      key={group.group_id + ":" + dataset.dataset_id}
                      dataset_id={group.group_id + ":" + dataset.dataset_id}
                      authors={formatCitation(dataset.authors, dataset.year)}
                      description={dataset.topic}
                      doi={dataset.reference && dataset.reference.replace(/^(https:\/\/doi\.org\/)/, "")}
                      title={dataset.title}
                      license={dataset.license}
                      link={dataset.link}
                      location={dataset.url}
                      isAddingDataset={props.isAddingDataset}
                      isAddDatasetError={props.isAddDatasetError}
                      setDatasetId={props.subset==="plugin"? props.setExtension : props.setBenchmark}
                      reset={props.reset}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
      )}
    </Root>
  );
};

export default DatasetFromEntryPoint;
