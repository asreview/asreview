import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
  Link,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
  boxFullWidth: {
    paddingTop: 40,
    paddingBottom: 30,
    height: "100%",
  },
  card: {
    height: "-webkit-fill-available",
    overflowY: "scroll",
  },
  title: {
    lineHeight: 1.2,
  },
  titleDebug: {
    lineHeight: 1.2,
    color: theme.overrides.debug.color,
  },
  debug: {
    color: theme.overrides.debug.color,
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
  stickToBottom: {
    width: "100%",
    position: "fixed",
    bottom: 0,
  },
  circularProgress: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const ArticleCard = (props) => {
  const classes = useStyles();

  const isDebugInclusion = () => {
    return props.record._debug_label === 1;
  };

  let alertInfo = "";
  if (props.previousSelection === 0) {
    alertInfo = "You marked this document as irrelevant.";
  }
  if (props.previousSelection === 1) {
    alertInfo = "You marked this document as relevant.";
  }

  return (
    <Container maxWidth="md" className={classes.boxFullWidth}>
      <Card className={classes.card}>
        {!props.isloaded && (
          <div className={classes.circularProgress}>
            <CircularProgress />
          </div>
        )}

        {/* Previous decision alert */}
        {props.previousSelection !== null && (
          <div>
            <Alert severity="info">{alertInfo}</Alert>
          </div>
        )}

        {props.isloaded && (
          <CardContent>
            {/* Show the title */}
            <Typography
              className={
                isDebugInclusion() ? classes.titleDebug : classes.title
              }
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
              {!(props.record.title === "" || props.record.title === null) && (
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
                  (isDebugInclusion() ? classes.debug : classes.publish_time) +
                  " fontSize" +
                  props.fontSize.label
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
            {!(props.record.doi === undefined || props.record.doi === null) && (
              <Typography
                className={
                  (isDebugInclusion() ? classes.debug : classes.doi) +
                  " fontSize" +
                  props.fontSize.label
                }
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
                (isDebugInclusion() ? classes.debug : classes.abstract) +
                " fontSize" +
                props.fontSize.label
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
        )}
      </Card>
    </Container>
  );
};

export default ArticleCard;
