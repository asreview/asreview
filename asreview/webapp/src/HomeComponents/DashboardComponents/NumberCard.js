import React from "react";
import NumberFormat from "react-number-format";
import { useQuery } from "react-query";
import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { CardErrorHandler } from "../../Components";
import { ProjectAPI } from "../../api/index.js";

import "./DashboardPage.css";

const PREFIX = "NumberCard";

const classes = {
  content: `${PREFIX}-content`,
  text: `${PREFIX}-text`,
};

const Root = styled("div")(({ theme }) => ({
  position: "relative",
  [`& .${classes.content}`]: {
    alignItems: "baseline",
    justifyContent: "center",
    [theme.breakpoints.down("md")]: {
      alignItems: "center",
    },
  },

  [`& .${classes.text}`]: {
    opacity: 0.72,
  },
}));

export default function NumberCard(props) {
  const { data, error, isError, isFetched, isSuccess } = useQuery(
    "fetchDashboardStats",
    ProjectAPI.fetchDashboardStats,
    { refetchOnWindowFocus: false },
  );

  return (
    <Root>
      <CardErrorHandler
        queryKey={"fetchDashboardStats"}
        error={error}
        isError={isError}
      />
      <Grid container spacing={3}>
        <Grid item xs={6} sm={6}>
          <Card
            className={`number-card dashboard-page-card-bg-yellow`}
            elevation={0}
          >
            <CardContent>
              <Stack
                direction={!props.mobileScreen ? "row" : "column"}
                spacing={!props.mobileScreen ? 3 : 1}
                className={`${classes.content} dashboard-page-card-text-yellow`}
              >
                <Typography
                  className="number-card-content-numeral"
                  variant={!props.mobileScreen ? "h4" : "h5"}
                >
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
                <Typography
                  className={`${classes.text} number-card-content-text`}
                  variant={!props.mobileScreen ? "subtitle1" : "subtitle2"}
                >
                  {data?.n_in_review < 2
                    ? "Project in Review"
                    : "Projects in Review"}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6}>
          <Card
            className={`number-card dashboard-page-card-bg-green`}
            elevation={0}
          >
            <CardContent>
              <Stack
                direction={!props.mobileScreen ? "row" : "column"}
                spacing={!props.mobileScreen ? 3 : 1}
                className={`${classes.content} dashboard-page-card-text-green`}
              >
                <Typography
                  className="number-card-content-numeral"
                  variant={!props.mobileScreen ? "h4" : "h5"}
                >
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
                <Typography
                  className={`${classes.text} number-card-content-text`}
                  variant={!props.mobileScreen ? "subtitle1" : "subtitle2"}
                >
                  {data?.n_finished < 2
                    ? "Project Finished"
                    : "Projects Finished"}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Root>
  );
}
