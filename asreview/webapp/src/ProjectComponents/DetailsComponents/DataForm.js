import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { Box, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { DataFormCard } from "../DetailsComponents";
import { TypographySubtitle1Medium } from "../../StyledComponents/StyledTypography.js";
import { ProjectAPI } from "../../api/index.js";

const Root = styled("div")(({ theme }) => ({}));

const DataForm = (props) => {
  const { project_id } = useParams();
  const queryClient = useQueryClient();

  const {
    data: dataset,
    error: fetchDataError,
    isError: isFetchDataError,
    isFetching: isFetchingData,
  } = useQuery(["fetchData", { project_id }], ProjectAPI.fetchData, {
    refetchOnWindowFocus: false,
  });

  const {
    data: labeledStats,
    error: fetchLabeledStatsError,
    isError: isFetchLabeledStatsError,
    isFetching: isFetchingLabeledStats,
  } = useQuery(
    ["fetchLabeledStats", { project_id }],
    ProjectAPI.fetchLabeledStats,
    {
      refetchOnWindowFocus: false,
    },
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
        <Box>
          <TypographySubtitle1Medium>Data</TypographySubtitle1Medium>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            A dataset contains textual records (e.g., abstracts of scientific
            papers, newspaper articles) that you want to label in interaction
            with the AI. Prior knowledge is required to warm up the AI.
          </Typography>
        </Box>
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
          setHistoryFilterQuery={props.setHistoryFilterQuery}
          refetch={refetchLabeledStats}
        />
      </Stack>
    </Root>
  );
};

export default DataForm;
