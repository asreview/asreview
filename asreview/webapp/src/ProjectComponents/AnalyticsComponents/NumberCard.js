import React from "react";
import NumberFormat from "react-number-format";
import {
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Skeleton,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { CardErrorHandler } from "Components";

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

  const getLabeledRecords = () => {
    if (showNumber()) {
      if (props.includePriorKnowledge) {
        return (
          (props.progressQuery.data["n_included"] || 0) +
          (props.progressQuery.data["n_excluded"] || 0)
        );
      } else {
        return (
          (props.progressQuery.data["n_included_no_priors"] || 0) +
          (props.progressQuery.data["n_excluded_no_priors"] || 0)
        );
      }
    }
    return 0;
  };

  const getRelevantRecords = () => {
    if (showNumber()) {
      if (props.includePriorKnowledge) {
        return props.progressQuery.data["n_included"] || 0;
      } else {
        return props.progressQuery.data["n_included_no_priors"] || 0;
      }
    }
    return 0;
  };

  const getIrrelevantRecordsSinceLastRelevant = () => {
    if (showNumber()) {
      // Always use the data without prior knowledge, regardless of the switch state
      return props.progressQuery.data["n_since_last_inclusion_no_priors"] !==
        null
        ? props.progressQuery.data["n_since_last_inclusion_no_priors"]
        : "-";
    }
    return 0;
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
                  Labeled records
                </Typography>
                {props.progressQuery.isLoading ? (
                  <Skeleton variant="text" width={100} height={50} />
                ) : (
                  <Typography
                    className="number-card-content-numeral"
                    variant={!props.mobileScreen ? "h4" : "h5"}
                  >
                    <NumberFormat
                      value={getLabeledRecords()}
                      displayType="text"
                      thousandSeparator
                    />
                  </Typography>
                )}
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
                  Relevant records
                </Typography>
                {props.progressQuery.isLoading ? (
                  <Skeleton variant="text" width={100} height={50} />
                ) : (
                  <Typography
                    className="number-card-content-numeral"
                    variant={!props.mobileScreen ? "h4" : "h5"}
                  >
                    <NumberFormat
                      value={getRelevantRecords()}
                      displayType="text"
                      thousandSeparator
                    />
                  </Typography>
                )}
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
                  Irrelevant records since last relevant
                </Typography>
                {props.progressQuery.isLoading ? (
                  <Skeleton variant="text" width={100} height={50} />
                ) : (
                  <Typography
                    className="number-card-content-numeral"
                    variant={!props.mobileScreen ? "h4" : "h5"}
                  >
                    {getIrrelevantRecordsSinceLastRelevant()}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Root>
  );
}
