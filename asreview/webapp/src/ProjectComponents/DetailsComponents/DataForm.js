import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import { Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

import { DataFormCard } from "../DetailsComponents";
import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";

const Root = styled("div")(({ theme }) => ({}));

const DataForm = (props) => {
  const queryClient = useQueryClient();

  const {
    data: dataset,
    error: fetchDataError,
    isError: isFetchDataError,
    isFetching: isFetchingData,
  } = useQuery(
    ["fetchData", { project_id: props.project_id }],
    ProjectAPI.fetchData,
    {
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: labeledStats,
    error: fetchLabeledStatsError,
    isError: isFetchLabeledStatsError,
    isFetching: isFetchingLabeledStats,
  } = useQuery(
    ["fetchLabeledStats", { project_id: props.project_id }],
    ProjectAPI.fetchLabeledStats,
    {
      refetchOnWindowFocus: false,
    }
  );

  const refetchData = () => {
    queryClient.resetQueries("fetchData");
  };

  const refetchLabeledStats = () => {
    queryClient.resetQueries("fetchLabeledStats");
  };

  const returnDataSecondary = () => {
    if (!isFetchingData) {
      return !isFetchDataError ? `Contains ${dataset?.n_rows} records` : ``;
    } else {
      return "Loading...";
    }
  };

  const returnLabeledStatsSecondary = () => {
    if (!isFetchingLabeledStats) {
      return !isFetchLabeledStatsError
        ? `${labeledStats?.n_prior_inclusions} relevant and ${labeledStats?.n_prior_exclusions} irrelevant records`
        : ``;
    } else {
      return "Loading...";
    }
  };

  return (
    <Root>
      <Stack spacing={3}>
        <DataFormCard
          isError={isFetchDataError}
          primary={
            !isFetchDataError
              ? `Dataset ${dataset ? dataset.filename : ``}`
              : fetchDataError.message
          }
          secondary={returnDataSecondary()}
          refetch={refetchData}
        />
        <DataFormCard
          isError={isFetchLabeledStatsError}
          primary={
            !isFetchLabeledStatsError
              ? `Prior knowledge`
              : fetchLabeledStatsError.message
          }
          secondary={returnLabeledStatsSecondary()}
          refetch={refetchLabeledStats}
        />
      </Stack>
    </Root>
  );
};

export default connect(mapStateToProps)(DataForm);
