import React from "react";
import { useQuery, useQueryClient } from "react-query";
import { Box, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from "../../../Components";
import { ExtensionDataset } from "../DataComponents";
import { ProjectAPI } from "../../../api/index.js";

const PREFIX = "DatasetFromExtension";

const classes = {
  card: `${PREFIX}-card`,
};

const Root = styled("div")(({ theme }) => ({
  textAlign: "center",
  [`& .${classes.card}`]: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    "& > *": {
      margin: theme.spacing(2),
    },
  },
}));

const DatasetFromExtension = (props) => {
  const queryClient = useQueryClient();

  const {
    data,
    error: fetchDatasetsError,
    isError: isFetchDatasetsError,
    isFetched,
    isFetching: isFetchingDatasets,
    isSuccess,
  } = useQuery(
    ["fetchDatasets", { subset: "plugin" }],
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

  return (
    <Root>
      {isFetchingDatasets && (
        <Box>
          <CircularProgress />
        </Box>
      )}
      {(isFetchDatasetsError || props.isAddDatasetError) && (
        <InlineErrorHandler
          message={returnError()}
          refetch={refetchDatasets}
          button={!props.isAddDatasetError ? "Try to refresh" : null}
        />
      )}
      {!isFetchingDatasets && isSuccess && isFetched && (
        <Box className={classes.card}>
          {data?.result.map((dataset, index) => (
            <ExtensionDataset
              key={index}
              extension={props.extension}
              setExtension={props.setExtension}
              isAddDatasetError={props.isAddDatasetError}
              isAddingDataset={props.isAddingDataset}
              reset={props.reset}
              dataset={dataset}
            />
          ))}
        </Box>
      )}
    </Root>
  );
};

export default DatasetFromExtension;
