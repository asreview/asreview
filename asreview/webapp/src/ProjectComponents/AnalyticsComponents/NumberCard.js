import React from "react";
import NumberFormat from "react-number-format";
import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { CardErrorHandler } from "../../Components";

const PREFIX = "NumberCard";

const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
  number: `${PREFIX}-number`,
  text: `${PREFIX}-text`,
};

const Root = styled("div")(({ theme }) => ({
  maxWidth: 960,
  position: "relative",
  width: "100%",
  [`& .${classes.root}`]: {
    borderRadius: 16,
    padding: 8,
  },

  [`& .${classes.content}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  [`& .${classes.number}`]: {
    fontWeight: theme.typography.fontWeightBold,
  },

  [`& .${classes.text}`]: {
    fontWeight: 600,
  },
}));

export default function NumberCard(props) {
  const showNumber = () => {
    return (
      props.progressQuery &&
      !props.progressQuery.isError &&
      props.progressQuery.isFetched &&
      props.progressQuery.isSuccess
    );
  };

  return (
    <Root>
      <CardErrorHandler
        queryKey={"fetchProgress"}
        error={props.progressQuery.error}
        isError={props.progressQuery.isError}
      />
      <Grid container spacing={3}>
        <Grid item xs={6} sm={6}>
          <Card className={classes.root} elevation={2}>
            <CardContent>
              <Stack spacing={2} className={classes.content}>
                <Typography
                  className={classes.text}
                  variant="subtitle1"
                  sx={{ color: "text.secondary" }}
                >
                  Labeled Records
                </Typography>
                <Typography className={classes.number} variant="h4">
                  <NumberFormat
                    value={
                      showNumber()
                        ? props.progressQuery.data["n_included"] +
                          props.progressQuery.data["n_excluded"]
                        : 0
                    }
                    displayType="text"
                    thousandSeparator
                  />
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6}>
          <Card className={classes.root} elevation={2}>
            <CardContent>
              <Stack spacing={2} className={classes.content}>
                <Typography
                  className={classes.text}
                  variant="subtitle1"
                  sx={{ color: "text.secondary" }}
                >
                  Relevant Records
                </Typography>
                <Typography className={classes.number} variant="h4">
                  <NumberFormat
                    value={
                      showNumber() ? props.progressQuery.data["n_included"] : 0
                    }
                    displayType="text"
                    thousandSeparator
                  />
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Card className={classes.root} elevation={2}>
            <CardContent>
              <Stack spacing={2} className={classes.content}>
                <Typography
                  className={classes.text}
                  variant="subtitle1"
                  sx={{ color: "text.secondary" }}
                >
                  Reviewed Records Since Last Relevant
                </Typography>
                <Typography className={classes.number} variant="h4">
                  <NumberFormat
                    value={
                      showNumber()
                        ? props.progressQuery.data["n_since_last_inclusion"]
                        : 0
                    }
                    displayType="text"
                    thousandSeparator
                  />
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Root>
  );
}
