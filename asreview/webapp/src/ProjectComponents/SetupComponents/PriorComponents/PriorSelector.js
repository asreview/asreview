import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useContext } from "react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Check } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { historyFilterOptions } from "globals.js";
import { AddPriorKnowledge } from ".";
import { useToggle } from "hooks/useToggle";
import { ProjectAPI } from "api";
import { ProjectContext } from "ProjectContext";

const PREFIX = "PriorSelector";

const classes = {
  cardContent: `${PREFIX}-card-content`,
  cardOverlay: `${PREFIX}-card-overlay`,
  singleLine: `${PREFIX}-single-line`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.cardContent}`]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    paddingRight: 8,
    position: "relative",
  },

  [`& .${classes.singleLine}`]: {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    whiteSpace: "pre-line",
    overflow: "hidden",
  },
}));

const PriorSelector = ({
  setHistoryFilterQuery,
  mobileScreen,
  editable = true,
}) => {
  const project_id = useContext(ProjectContext);

  const navigate = useNavigate();

  const [onAddPrior, toggleAddPrior] = useToggle();

  const handleClickViewPrior = () => {
    navigate(`/projects/${project_id}/history`);
    setHistoryFilterQuery([
      historyFilterOptions.find((e) => e.value === "prior"),
    ]);
  };

  const { data } = useQuery(
    ["fetchLabeledStats", { project_id: project_id }],
    ProjectAPI.fetchLabeledStats,
    {
      enabled: project_id !== null,
      refetchOnWindowFocus: false,
    },
  );

  return (
    <Root>
      <Card>
        <CardHeader
          title="Your knowledge"
          subheader={
            <>
              <>Your knowledge can help to warm up and accelerate the AI. </>
              <Link
                underline="none"
                href={`https://asreview.nl/blog/active-learning-explained/`}
                target="_blank"
              >
                learn more
              </Link>
            </>
          }
        />
        <CardContent>
          <Stack spacing={1}>
            {(data?.n_inclusions === 0 || data?.n_exclusions === 0) && (
              <Typography
                variant="body2"
                className={classes.singleLine}
                sx={{ color: "text.secondary" }}
              >
                Label 1 or more relevant records to warm up the AI. It's also
                possible to label irrelevant records.
              </Typography>
            )}
            {data?.n_inclusions !== 0 && data?.n_exclusions !== 0 && (
              <Typography
                variant="body2"
                className={classes.singleLine}
                sx={{ color: "text.secondary" }}
              >
                {`${data?.n_prior_inclusions} relevant and ${data?.n_prior_exclusions} irrelevant records`}
              </Typography>
            )}
          </Stack>
          {editable && (
            <Button
              id={"add-prior"}
              onClick={toggleAddPrior}
              variant="contained"
            >
              {data?.n_inclusions === 0 || data?.n_exclusions === 0
                ? "Add"
                : "Edit"}
            </Button>
          )}
          {!editable && <Button onClick={handleClickViewPrior}>View</Button>}
        </CardContent>

        <AddPriorKnowledge
          open={onAddPrior}
          mobileScreen={mobileScreen}
          toggleAddPrior={toggleAddPrior}
        />
      </Card>
    </Root>
  );
};

export default PriorSelector;
