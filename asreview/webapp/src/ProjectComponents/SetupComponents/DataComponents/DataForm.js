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
    }
  );

  const priorAdded = () => {
    return data?.n_inclusions !== 0 && data?.n_exclusions !== 0;
  };

  const refetchInfo = () => {
    queryClient.prefetchQuery(
      ["fetchInfo", { project_id: props.project_id }],
      ProjectAPI.fetchInfo
    );
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
      {!props.isFetchInfoError && isFetching && (
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
      {!isFetching && isError && (
        <InlineErrorHandler message={error?.message} refetch={refetch} button />
      )}
      {!isFetching && !isError && (
        <Stack direction="column" spacing={3}>
          <DataFormCard
            added={priorAdded()}
            primaryDefault="Add prior knowledge"
            primaryAdded="Prior knowledge added"
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
