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
  text: `${PREFIX}-text`,
};

const Root = styled("div")(({ theme }) => ({
  position: "relative",
  [`& .${classes.text}`]: {
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
          <Card
            className={`number-card dashboard-page-card-bg-yellow`}
            elevation={0}
          >
            <CardContent>
              <Stack
                spacing={1}
                className={`number-card-content dashboard-page-card-text-yellow`}
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
                  Projects in Review
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            className={`number-card dashboard-page-card-bg-green`}
            elevation={0}
          >
            <CardContent>
              <Stack
                spacing={1}
                className={`number-card-content dashboard-page-card-text-green`}
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
                  Projects Finished
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            className={`number-card dashboard-page-card-bg-blue`}
            elevation={0}
          >
            <CardContent>
              <Stack
                spacing={1}
                className={`number-card-content dashboard-page-card-text-blue`}
              >
                <Typography
                  className="number-card-content-numeral"
                  variant={!props.mobileScreen ? "h4" : "h5"}
                >
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
                <Typography
                  className={`${classes.text} number-card-content-text`}
                  variant={!props.mobileScreen ? "subtitle1" : "subtitle2"}
                >
                  Labeled Records
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            className={`number-card dashboard-page-card-bg-red`}
            elevation={0}
          >
            <CardContent>
              <Stack
                spacing={1}
                className={`number-card-content dashboard-page-card-text-red`}
              >
                <Typography
                  className="number-card-content-numeral"
                  variant={!props.mobileScreen ? "h4" : "h5"}
                >
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
                <Typography
                  className={`${classes.text} number-card-content-text`}
                  variant={!props.mobileScreen ? "subtitle1" : "subtitle2"}
                >
                  Relevant Records
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Root>
  );
}
