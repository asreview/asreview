import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Check } from "@mui/icons-material";

import { InlineErrorHandler } from "../../Components";
import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";

const PREFIX = "DataForm";

const classes = {
  title: `${PREFIX}-title`,
  cardContent: `${PREFIX}-card-content`,
  cardOverlay: `${PREFIX}-card-overlay`,
  singleLine: `${PREFIX}-single-line`,
  loading: `${PREFIX}-loading`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.title}`]: {
    paddingBottom: 24,
  },

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
    WebkitLineClamp: 1,
    whiteSpace: "pre-line",
    overflow: "hidden",
  },

  [`& .${classes.loading}`]: {
    display: "flex",
    justifyContent: "center",
  },
}));

const DataForm = (props) => {
  const queryClient = useQueryClient();

  const { data, error, isError, isFetched, isFetching, isSuccess } = useQuery(
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

  const refetchLabeledStats = () => {
    queryClient.resetQueries("fetchLabeledStats");
  };

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
      {isFetching && (
        <Box className={classes.loading}>
          <CircularProgress />
        </Box>
      )}
      {!isFetching && isError && (
        <InlineErrorHandler
          message={error?.message}
          refetch={refetchData}
          button="Try to refresh"
        />
      )}
      {!isFetching && !isError && (
        <Stack direction="column" spacing={3}>
          <Card
            elevation={0}
            sx={{
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "grey.900" : "grey.100",
            }}
          >
            <CardContent className={classes.cardContent}>
              {(!props.details?.projectHasDataset || isError) && (
                <Stack spacing={1}>
                  <Typography
                    variant="subtitle1"
                    className={classes.singleLine}
                    sx={{
                      fontWeight: (theme) => theme.typography.fontWeightMedium,
                    }}
                  >
                    Add a dataset
                  </Typography>
                  <Typography
                    variant="body2"
                    className={classes.singleLine}
                    sx={{ color: "text.secondary" }}
                  >
                    Contain all records related to a particular topic
                  </Typography>
                </Stack>
              )}
              {props.details?.projectHasDataset &&
                !isError &&
                isFetched &&
                isSuccess && (
                  <Stack spacing={1}>
                    <Typography
                      variant="subtitle1"
                      className={classes.singleLine}
                      sx={{
                        fontWeight: (theme) =>
                          theme.typography.fontWeightMedium,
                      }}
                    >
                      Dataset <i>{data?.filename}</i> added
                    </Typography>
                    <Typography
                      variant="body2"
                      className={classes.singleLine}
                      sx={{ color: "text.secondary" }}
                    >
                      Contain {data?.n_rows} records
                    </Typography>
                  </Stack>
                )}
              <Stack direction="row" sx={{ alignItems: "center" }}>
                {props.details?.projectHasDataset && !isError && (
                  <Check color="success" sx={{ mr: 1 }} />
                )}
                <Button disabled={isError} onClick={props.toggleAddDataset}>
                  {!props.details?.projectHasDataset || isError
                    ? "Add"
                    : "Edit"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
          <Card
            elevation={0}
            sx={{
              bgcolor: (theme) => {
                if (theme.palette.mode === "dark") {
                  return "grey.900";
                }
                if (theme.palette.mode === "light") {
                  return "grey.100";
                }
              },
            }}
          >
            <CardContent className={classes.cardContent}>
              <Box
                className={classes.cardOverlay}
                sx={{
                  bgcolor: (theme) => {
                    if (!props.details?.projectHasDataset || isError) {
                      if (theme.palette.mode === "dark") {
                        return "rgba(40, 40, 40, 0.6)";
                      } else {
                        return "rgba(255, 255, 255, 0.5)";
                      }
                    } else {
                      return "transparent";
                    }
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
                  Add prior knowledge
                </Typography>
                <Typography
                  variant="body2"
                  className={classes.singleLine}
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  Indicate your preference with at least 1 relevant and 1
                  irrelevant records
                </Typography>
              </Stack>
              <Box>
                <Button
                  disabled={!props.details?.projectHasDataset || isError}
                  onClick={props.toggleAddPriorKnowledge}
                >
                  Add
                </Button>
              </Box>
            </CardContent>
          </Card>
          {props.isFetchLabeledStatsError && (
            <InlineErrorHandler
              message={props.fetchLabeledStatsError?.message}
              refetch={refetchLabeledStats}
              button="Try to refresh"
            />
          )}
        </Stack>
      )}
    </Root>
  );
};

export default connect(mapStateToProps)(DataForm);
