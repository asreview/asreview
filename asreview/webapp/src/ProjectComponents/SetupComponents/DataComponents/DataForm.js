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

  const { data, error, isError, isFetching, refetch } = useQuery(
    ["fetchLabeledStats", { project_id: props.project_id }],
    ProjectAPI.fetchLabeledStats,
    {
      enabled: props.project_id !== null,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data.n_prior_inclusions !== 0 && data.n_prior_exclusions !== 0) {
          props.handleComplete(true);
        } else {
          props.handleComplete(false);
        }
      },
    },
  );

  const priorAdded = () => {
    return data?.n_inclusions !== 0 && data?.n_exclusions !== 0;
  };

  const refetchInfo = () => {
    queryClient.prefetchQuery(
      ["fetchInfo", { project_id: props.project_id }],
      ProjectAPI.fetchInfo,
    );
  };

  return (
    <Root>
      <Box className={classes.title}>
        <Typography variant="h6">Review criteria</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {/* {Description} */}
        </Typography>
      </Box>
      {!props.isFetchInfoError &&
        (isFetching || props.isFetchingLabeledStats) && (
          <Box className={classes.loading}>
            <CircularProgress />
          </Box>
        )}
      {!isFetching && isError && (
        <InlineErrorHandler
          message={error?.message}
          refetch={refetch}
          button={true}
        />
      )}
      {props.isFetchInfoError && (
        <InlineErrorHandler
          message={props.fetchInfoError?.message}
          refetch={refetchInfo}
          button={true}
        />
      )}
      {!isFetching && isError && (
        <InlineErrorHandler message={error?.message} refetch={refetch} button />
      )}
      {!isFetching && !isError && (
        <Stack direction="column" spacing={3}>
          <DataFormCard
            added={priorAdded()}
            primaryDefault="Add prior knowledge"
            secondaryDefault="Label at least 1 relevant and 1 irrelevant record to warm up the AI"
            secondaryAdded={`${data?.n_prior_inclusions} relevant and ${data?.n_prior_exclusions} irrelevant records`}
            toggleAddCard={props.toggleAddPrior}
          />
        </Stack>
      )}
    </Root>
  );
};

export default connect(mapStateToProps)(DataForm);
