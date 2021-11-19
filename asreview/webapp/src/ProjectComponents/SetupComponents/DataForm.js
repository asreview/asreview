import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from "../../Components";
import { DataFormCard } from "../SetupComponents";
import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";

const PREFIX = "DataForm";

const classes = {
  title: `${PREFIX}-title`,
  loading: `${PREFIX}-loading`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.title}`]: {
    paddingBottom: 24,
  },

  [`& .${classes.loading}`]: {
    display: "flex",
    justifyContent: "center",
  },
}));

const DataForm = (props) => {
  const queryClient = useQueryClient();

  const { data, error, isError, isFetching } = useQuery(
    ["fetchData", { project_id: props.project_id }],
    ProjectAPI.fetchData,
    {
      enabled:
        props.details?.projectHasDataset !== undefined &&
        props.details?.projectHasDataset,
      refetchOnWindowFocus: false,
    }
  );

  const refetchData = () => {
    queryClient.resetQueries("fetchData");
  };

  const refetchLabeledStats = () => {
    queryClient.resetQueries("fetchLabeledStats");
  };

  return (
    <Root>
      <Box className={classes.title}>
        <Typography variant="h6">Data</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Active learning models help you accelerate the review of records in
          your dataset (e.g., abstracts of scientific papers) by learning your
          preferences.
        </Typography>
      </Box>
      {(isFetching || props.isFetchingLabeledStats) && (
        <Box className={classes.loading}>
          <CircularProgress />
        </Box>
      )}
      {!isFetching && isError && (
        <InlineErrorHandler
          message={error?.message}
          refetch={refetchData}
          button="Try to refresh"
        />
      )}
      {!props.isFetchingLabeledStats && props.isFetchLabeledStatsError && (
        <InlineErrorHandler
          message={props.fetchLabeledStatsError?.message}
          refetch={refetchLabeledStats}
          button="Try to refresh"
        />
      )}
      {!isFetching &&
        !props.isFetchingLabeledStats &&
        !isError &&
        !props.isFetchLabeledStatsError && (
          <Stack direction="column" spacing={3}>
            <DataFormCard
              added={props.details?.projectHasDataset}
              primaryDefault="Add a dataset"
              primaryAdded={
                <React.Fragment>
                  Dataset <i>{data?.filename}</i> added
                </React.Fragment>
              }
              secondaryDefault="Contain all records related to a particular topic"
              secondaryAdded={
                <React.Fragment>Contain {data?.n_rows} records</React.Fragment>
              }
              toggleAddCard={props.toggleAddDataset}
            />
            <DataFormCard
              added={props.labeledStats?.n_prior !== 0}
              projectHasDataset={props.details?.projectHasDataset}
              primaryDefault="Add prior knowledge"
              primaryAdded="Prior knowledge added"
              secondaryDefault="Indicate your preference with at least 1 relevant and 1 irrelevant records"
              secondaryAdded={
                <React.Fragment>
                  {props.labeledStats?.n_prior_inclusions} relevant and{" "}
                  {props.labeledStats?.n_prior_exclusions} irrelevant records
                </React.Fragment>
              }
              toggleAddCard={props.toggleAddPriorKnowledge}
            />
          </Stack>
        )}
    </Root>
  );
};

export default connect(mapStateToProps)(DataForm);
