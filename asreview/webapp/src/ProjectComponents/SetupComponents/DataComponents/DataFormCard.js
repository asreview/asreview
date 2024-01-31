import * as React from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { Check } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { historyFilterOptions } from "../../../globals.js";

const PREFIX = "DataFormCard";

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

  [`& .${classes.cardOverlay}`]: {
    height: "100%",
    width: "100%",
    left: 0,
    pointerEvents: "none",
    position: "absolute",
    zIndex: 1,
  },

  [`& .${classes.singleLine}`]: {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    whiteSpace: "pre-line",
    overflow: "hidden",
  },
}));

const DataFormCard = ({
  project_id,
  added,
  datasetAdded,
  primaryDefault,
  secondaryDefault,
  setHistoryFilterQuery,
  secondaryAdded,
  toggleAddCard,
  editable = true,
}) => {
  const navigate = useNavigate();

  const handleClickViewPrior = () => {
    navigate(`/projects/${project_id}/history`);
    setHistoryFilterQuery([
      historyFilterOptions.find((e) => e.value === "prior"),
    ]);
  };

  return (
    <Root>
      <Card
        elevation={0}
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "background.paper" : "grey.100",
        }}
      >
        <CardContent className={classes.cardContent}>
          <Box
            className={classes.cardOverlay}
            sx={{
              bgcolor: (theme) => {
                return "transparent";
              },
            }}
          />
          <Stack spacing={1}>
            <Typography
              variant="subtitle1"
              className={classes.singleLine}
              sx={{
                fontWeight: (theme) => theme.typography.fontWeightMedium,
              }}
            >
              {primaryDefault}
            </Typography>
            {!added && (
              <Typography
                variant="body2"
                className={classes.singleLine}
                sx={{ color: "text.secondary" }}
              >
                {secondaryDefault}
              </Typography>
            )}
            {added && (
              <Typography
                variant="body2"
                className={classes.singleLine}
                sx={{ color: "text.secondary" }}
              >
                {secondaryAdded}
              </Typography>
            )}
          </Stack>
          <Stack direction="row" sx={{ alignItems: "center" }}>
            {added && <Check color="success" sx={{ mr: 1 }} />}
            {editable && (
              <Button
                id={(primaryDefault || "add")
                  .toLowerCase()
                  .replace(/\s+/g, "-")}
                disabled={datasetAdded !== undefined && !datasetAdded}
                onClick={toggleAddCard}
              >
                {!added ? "Add" : "Edit"}
              </Button>
            )}
            {!editable && <Button onClick={handleClickViewPrior}>View</Button>}
          </Stack>
        </CardContent>
      </Card>
    </Root>
  );
};

export default DataFormCard;
