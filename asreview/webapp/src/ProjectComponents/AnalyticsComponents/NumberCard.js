import React from "react";
import NumberFormat from "react-number-format";
import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { CardErrorHandler } from "../../Components";

const Root = styled("div")(({ theme }) => ({
  position: "relative",
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
          <Card className="number-card" elevation={2}>
            <CardContent>
              <Stack spacing={2} className="number-card-content">
                <Typography
                  className="number-card-content-text"
                  variant={!props.mobileScreen ? "subtitle1" : "subtitle2"}
                  sx={{ color: "text.secondary" }}
                >
                  Labeled Records
                </Typography>
                <Typography
                  className="number-card-content-numeral"
                  variant={!props.mobileScreen ? "h4" : "h5"}
                >
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
          <Card className="number-card" elevation={2}>
            <CardContent>
              <Stack spacing={2} className="number-card-content">
                <Typography
                  className="number-card-content-text"
                  variant={!props.mobileScreen ? "subtitle1" : "subtitle2"}
                  sx={{ color: "text.secondary" }}
                >
                  Relevant Records
                </Typography>
                <Typography
                  className="number-card-content-numeral"
                  variant={!props.mobileScreen ? "h4" : "h5"}
                >
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
          <Card className="number-card" elevation={2}>
            <CardContent>
              <Stack spacing={2} className="number-card-content">
                <Typography
                  className="number-card-content-text"
                  variant={!props.mobileScreen ? "subtitle1" : "subtitle2"}
                  sx={{ color: "text.secondary" }}
                >
                  Labeled Records Since Last Relevant
                </Typography>
                <Typography
                  className="number-card-content-numeral"
                  variant={!props.mobileScreen ? "h4" : "h5"}
                >
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
