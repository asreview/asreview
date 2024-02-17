import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useContext } from "react";

import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { Check } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { historyFilterOptions } from "../../../globals";
import { AddPriorKnowledge } from "../PriorComponents";
import { useToggle } from "../../../hooks/useToggle";
import { ProjectAPI } from "../../../api";
import { ProjectContext } from "../../../ProjectContext";

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
        <CardContent className={classes.cardContent}>
          <Stack spacing={1}>
            <Typography
              variant="subtitle1"
              className={classes.singleLine}
              sx={{
                fontWeight: (theme) => theme.typography.fontWeightMedium,
              }}
            >
              Add prior knowledge
            </Typography>
            {(data?.n_inclusions === 0 || data?.n_exclusions === 0) && (
              <Typography
                variant="body2"
                className={classes.singleLine}
                sx={{ color: "text.secondary" }}
              >
                Label at least 1 relevant and 1 irrelevant record to warm up the
                AI
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
          <Stack direction="row" sx={{ alignItems: "center" }}>
            {data?.n_inclusions !== 0 && data?.n_exclusions !== 0 && (
              <Check color="success" sx={{ mr: 1 }} />
            )}
            {editable && (
              <Button id={"add-prior"} onClick={toggleAddPrior}>
                {data?.n_inclusions === 0 || data?.n_exclusions === 0
                  ? "Add"
                  : "Edit"}
              </Button>
            )}
            {!editable && <Button onClick={handleClickViewPrior}>View</Button>}
          </Stack>
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
