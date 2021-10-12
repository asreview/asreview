import React from "react";
import { useQuery } from "react-query";
import { styled } from "@mui/material/styles";

import {
  NumberCard,
  ProgressDensityChart,
  ProgressRecallChart,
} from "../AnalyticsComponents";

import { ProjectAPI } from "../../api/index.js";

const Root = styled("div")(({ theme }) => ({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  padding: 24,
  "& > *": {
    margin: theme.spacing(2),
  },
}));

export default function AnalyticsPage(props) {
  const progressQuery = useQuery(
    ["fetchProgress", { project_id: props.project_id }],
    ProjectAPI.fetchProgress,
    { refetchOnWindowFocus: false }
  );
  const progressDensityQuery = useQuery(
    ["fetchProgressDensity", { project_id: props.project_id }],
    ProjectAPI.fetchProgressDensity,
    { refetchOnWindowFocus: false }
  );
  const progressRecallQuery = useQuery(
    ["fetchProgressRecall", { project_id: props.project_id }],
    ProjectAPI.fetchProgressRecall,
    { refetchOnWindowFocus: false }
  );

  return (
    <Root>
      <NumberCard progressQuery={progressQuery} />
      <ProgressDensityChart progressDensityQuery={progressDensityQuery} />
      <ProgressRecallChart progressRecallQuery={progressRecallQuery} />
    </Root>
  );
}
