import * as React from "react";
import { useQuery } from "react-query";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { CardErrorHandler } from "../../../Components";
import { ProjectAPI } from "../../../api";

import { useContext } from "react";
import { ProjectContext } from "../../../ProjectContext";
import { styled } from "@mui/material/styles";

const PREFIX = "DatasetInfo";

const classes = {
  button: `${PREFIX}-button`,
  cardOverlay: `${PREFIX}-cardOverlay`,
  singleLine: `${PREFIX}-singleLine`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.button}`]: {
    display: "flex",
    justifyContent: "center",
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

const DatasetInfo = ({ project_id, dataset_path }) => {
  const {
    data,
    error: fetchDataError,
    isError: isFetchDataError,
    isFetching: isFetchingData,
  } = useQuery(
    ["fetchData", { project_id: project_id }],
    ProjectAPI.fetchData,
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <Root>
      <Card
        elevation={0}
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "background.paper" : "grey.100",
        }}
      >
        <CardContent>
          <Box
            className={classes.cardOverlay}
            sx={{
              bgcolor: "transparent",
            }}
          />
          <Stack spacing={2}>
            <Stack>
              <Typography
                variant="body2"
                className={classes.singleLine}
                sx={{ color: "text.secondary" }}
              >
                Dataset filename
              </Typography>
              <Typography variant="body2" className={classes.singleLine}>
                {dataset_path}
              </Typography>
            </Stack>
            <Stack>
              <Typography
                variant="body2"
                className={classes.singleLine}
                sx={{ color: "text.secondary" }}
              >
                Records
              </Typography>
              <Typography variant="body2" className={classes.singleLine}>
                {data?.n_rows}
              </Typography>
            </Stack>
            <Stack>
              <Typography
                variant="body2"
                className={classes.singleLine}
                sx={{ color: "text.secondary" }}
              >
                Duplicates
              </Typography>
              <Typography variant="body2" className={classes.singleLine}>
                About {data?.n_duplicates}
              </Typography>
            </Stack>
          </Stack>

          {isFetchingData && (
            <Box className="main-page-body-wrapper">
              <CircularProgress />
            </Box>
          )}
          <CardErrorHandler
            queryKey={"fetchData"}
            error={fetchDataError}
            isError={isFetchDataError}
          />
        </CardContent>
      </Card>
    </Root>
  );
};

export default DatasetInfo;
