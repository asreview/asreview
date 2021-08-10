import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
  Link,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 4,
    boxShadow:
      "0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)",
    flexDirection: "column",
    height: "-webkit-fill-available",
    margin: "auto",
    maxWidth: 960,
    marginTop: 40,
    marginBottom: 30,
    [theme.breakpoints.down("sm")]: {
      marginTop: 16,
      marginRight: 0,
      marginLeft: 0,
    },
  },
  alert: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  recordGrid: {
    flexGrow: 1,
    overflowY: "scroll",
  },
  recordCard: {
    border: "none",
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 4,
    height: "100%",
    overflowY: "scroll",
  },
  title: {
    lineHeight: 1.2,
  },
  abstract: {
    whiteSpace: "pre-line",
  },
  doi: {},
  publish_time: {},
  link: {
    marginLeft: "6px",
  },
  authors: {
    fontWeight: "bolder",
  },
  circularProgressGrid: {
    height: "inherit",
  },
  circularProgressCard: {
    alignItems: "center",
    border: "none",
    display: "flex",
    height: "100%",
    justifyContent: "center",
  },
}));

const RecordCard = (props) => {
  const classes = useStyles();

  const isDebugInclusion = () => {
    if (props.record) {
      return props.record._debug_label === 1;
    }
  };

  return (
    <Grid container className={classes.root} wrap="nowrap">
      {!props.isloaded && (
        <Grid item className={classes.circularProgressGrid}>
          <Card className={classes.circularProgressCard} variant="outlined">
            <CircularProgress />
          </Card>
        </Grid>
      )}

      {/* Previous decision alert */}
      {isDebugInclusion() && (
        <Grid item>
          <div>
            <Alert className={classes.alert} severity="info">
              This record was pre-labeled as relevant.
            </Alert>
          </div>
        </Grid>
      )}

      {props.isloaded && (
        <Grid item className={classes.recordGrid}>
          <Card className={classes.recordCard} square variant="outlined">
            <CardContent>
              {/* Show the title */}
              <Typography
                className={classes.title}
                variant="h5"
                color="textSecondary"
                component="div"
                paragraph
              >
                {/* No title, inplace text */}
                {(props.record.title === "" || props.record.title === null) && (
                  <Box
                    className={"fontSize" + props.fontSize.label}
                    fontStyle="italic"
                  >
                    This document doesn't have a title.
                  </Box>
                )}

                {/* No title, inplace text */}
                {!(
                  props.record.title === "" || props.record.title === null
                ) && (
                  <Box className={"fontSize" + props.fontSize.label}>
                    {props.record.title}
                  </Box>
                )}
              </Typography>

              {/* Show the publication date if available */}
              {!(
                props.record.publish_time === undefined ||
                props.record.publish_time === null
              ) && (
                <Typography
                  className={
                    classes.publish_time + " fontSize" + props.fontSize.label
                  }
                  color="textSecondary"
                  component="p"
                  fontStyle="italic"
                  paragraph
                >
                  {props.record.publish_time}
                </Typography>
              )}

              {/* Show the publication date if available */}
              {!(
                props.record.doi === undefined || props.record.doi === null
              ) && (
                <Typography
                  className={classes.doi + " fontSize" + props.fontSize.label}
                  color="textSecondary"
                  component="p"
                  fontStyle="italic"
                  paragraph
                >
                  DOI:
                  <Link
                    href={"https://doi.org/" + props.record.doi}
                    className={classes.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {props.record.doi}
                  </Link>
                </Typography>
              )}

              {/* Show the abstract */}
              <Typography
                className={
                  classes.abstract + " fontSize" + props.fontSize.label
                }
                variant="body2"
                color="textSecondary"
                component="div"
                paragraph
              >
                {/* No abstract, inplace text */}
                {(props.record.abstract === "" ||
                  props.record.abstract === null) && (
                  <Box fontStyle="italic">
                    This document doesn't have an abstract.
                  </Box>
                )}

                {/* No abstract, inplace text */}
                {!(
                  props.record.abstract === "" || props.record.abstract === null
                ) && <Box>{props.record.abstract}</Box>}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default RecordCard;
