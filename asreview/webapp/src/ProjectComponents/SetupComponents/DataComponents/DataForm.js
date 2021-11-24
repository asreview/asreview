import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from "../../../Components";
import { DataFormCard } from "../DataComponents";
import { ProjectAPI } from "../../../api/index.js";
import { mapStateToProps } from "../../../globals.js";

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

  const refetchDetails = () => {
    queryClient.prefetchQuery(
      ["fetchInfo", { project_id: props.project_id }],
      ProjectAPI.fetchInfo
    );
  };

  const refetchLabeledStats = () => {
    queryClient.resetQueries("fetchLabeledStats");
  };

  // fetch details in data step when init a new project
  React.useEffect(() => {
    if (!props.details && props.project_id !== null) {
      queryClient.prefetchQuery(
        ["fetchInfo", { project_id: props.project_id }],
        ProjectAPI.fetchInfo
      );
    }
  }, [props.details, props.project_id, queryClient]);

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
      {!props.isFetchDetailsError &&
        (!props.details || isFetching || props.isFetchingLabeledStats) && (
          <Box className={classes.loading}>
            <CircularProgress />
          </Box>
        )}
      {!isFetching && isError && (
        <InlineErrorHandler
          message={error?.message}
          refetch={refetchData}
          button={true}
        />
      )}
      {props.isFetchDetailsError && (
        <InlineErrorHandler
          message={props.fetchDetailsError?.message}
          refetch={refetchDetails}
          button={true}
        />
      )}
      {!props.isFetchingLabeledStats && props.isFetchLabeledStatsError && (
        <InlineErrorHandler
          message={props.fetchLabeledStatsError?.message}
          refetch={refetchLabeledStats}
          button={true}
        />
      )}
      {props.details &&
        !isFetching &&
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
              secondaryAdded={`Contain ${data?.n_rows} records`}
              toggleAddCard={props.toggleAddDataset}
            />
            <DataFormCard
              added={
                props.labeledStats?.n_inclusions !== 0 &&
                props.labeledStats?.n_exclusions !== 0
              }
              projectHasDataset={props.details?.projectHasDataset}
              primaryDefault="Add prior knowledge"
              primaryAdded="Prior knowledge added"
              secondaryDefault="Indicate your preference with at least 1 relevant and 1 irrelevant records"
              secondaryAdded={`${props.labeledStats?.n_prior_inclusions} relevant and ${props.labeledStats?.n_prior_exclusions} irrelevant records`}
              toggleAddCard={props.toggleAddPriorKnowledge}
            />
          </Stack>
        )}
    </Root>
  );
};

export default connect(mapStateToProps)(DataForm);
