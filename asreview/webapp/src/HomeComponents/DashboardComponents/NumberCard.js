import React from "react";
import NumberFormat from "react-number-format";
import { useQuery } from "react-query";
import { Grid, Paper, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { CardErrorHandler } from "../../Components";
import { ProjectAPI } from "../../api/index.js";

const PREFIX = "NumberCard";

const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
  number: `${PREFIX}-number`,
  text: `${PREFIX}-text`,
};

const Root = styled("div")(({ theme }) => ({
  position: "relative",
  [`& .${classes.root}`]: {
    borderRadius: 16,
    padding: "32px 0px",
    display: "flex",
  },

  [`& .${classes.content}`]: {
    textAlign: "center",
    margin: "auto",
  },

  [`& .${classes.number}`]: {
    fontWeight: 700,
  },

  [`& .${classes.text}`]: {
    fontWeight: 600,
    opacity: 0.72,
  },
}));

export default function NumberCard(props) {
  const { data, error, isError, isFetched, isSuccess } = useQuery(
    "fetchDashboardStats",
    ProjectAPI.fetchDashboardStats,
    { refetchOnWindowFocus: false }
  );

  return (
    <Root>
      <CardErrorHandler
        queryKey={"fetchDashboardStats"}
        error={error}
        isError={isError}
      />
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Paper
            className={classes.root}
            elevation={0}
            sx={{ bgcolor: "#fff7cd" }}
          >
            <Stack
              spacing={1}
              className={classes.content}
              sx={{ color: "#7a4f01" }}
            >
              <Typography className={classes.number} variant="h4">
                <NumberFormat
                  value={
                    !isError && isFetched && isSuccess && data.n_in_review
                      ? data.n_in_review
                      : 0
                  }
                  displayType="text"
                  thousandSeparator
                />
              </Typography>
              <Typography className={classes.text} variant="body2">
                Projects in Review
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            className={classes.root}
            elevation={0}
            sx={{ bgcolor: "#c8facd" }}
          >
            <Stack
              spacing={1}
              className={classes.content}
              sx={{ color: "#005249" }}
            >
              <Typography className={classes.number} variant="h4">
                <NumberFormat
                  value={
                    !isError && isFetched && isSuccess && data.n_finished
                      ? data.n_finished
                      : 0
                  }
                  displayType="text"
                  thousandSeparator
                />
              </Typography>
              <Typography className={classes.text} variant="body2">
                Projects Finished
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            className={classes.root}
            elevation={0}
            sx={{ bgcolor: "#d0f2ff" }}
          >
            <Stack
              spacing={1}
              className={classes.content}
              sx={{ color: "#04297a" }}
            >
              <Typography className={classes.number} variant="h4">
                <NumberFormat
                  value={
                    !isError && isFetched && isSuccess && data.n_reviewed
                      ? data.n_reviewed
                      : 0
                  }
                  displayType="text"
                  thousandSeparator
                />
              </Typography>
              <Typography className={classes.text} variant="body2">
                Labeled Records
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            className={classes.root}
            elevation={0}
            sx={{ bgcolor: "#ffe7d9" }}
          >
            <Stack
              spacing={1}
              className={classes.content}
              sx={{ color: "#7a0c2e" }}
            >
              <Typography className={classes.number} variant="h4">
                <NumberFormat
                  value={
                    !isError && isFetched && isSuccess && data.n_included
                      ? data.n_included
                      : 0
                  }
                  displayType="text"
                  thousandSeparator
                />
              </Typography>
              <Typography className={classes.text} variant="body2">
                Relevant Records
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Root>
  );
}
