import * as React from "react";
import { useQueryClient } from "react-query";
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

  const priorAdded = () => {
    return (
      props.labeledStats &&
      props.labeledStats.n_inclusions !== 0 &&
      props.labeledStats.n_exclusions !== 0
    );
  };

  const refetchInfo = () => {
    queryClient.prefetchQuery(
      ["fetchInfo", { project_id: props.project_id }],
      ProjectAPI.fetchInfo
    );
  };

  const refetchLabeledStats = () => {
    queryClient.resetQueries("fetchLabeledStats");
  };

  return (
    <Root>
      <Box className={classes.title}>
        <Typography variant="h6">Data</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          A dataset contains textual records (e.g., abstracts of scientific
          papers, newspaper articles) that you want to label in interaction with
          the AI. Prior knowledge is required to warm up the AI.
        </Typography>
      </Box>
      {!props.isFetchInfoError && props.isFetchingLabeledStats && (
        <Box className={classes.loading}>
          <CircularProgress />
        </Box>
      )}
      {props.isFetchInfoError && (
        <InlineErrorHandler
          message={props.fetchInfoError?.message}
          refetch={refetchInfo}
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
      {!props.isFetchingLabeledStats && !props.isFetchLabeledStatsError && (
        <Stack direction="column" spacing={3}>
          <DataFormCard
            added={priorAdded()}
            primaryDefault="Add prior knowledge"
            primaryAdded="Prior knowledge added"
            secondaryDefault="Label at least 1 relevant and 1 irrelevant record to warm up the AI"
            secondaryAdded={`${props.labeledStats?.n_prior_inclusions} relevant and ${props.labeledStats?.n_prior_exclusions} irrelevant records`}
            toggleAddCard={props.toggleAddPrior}
          />
        </Stack>
      )}
    </Root>
  );
};

export default connect(mapStateToProps)(DataForm);
