import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Slide,
  Typography,
  Link,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import { NoteSheet } from "../ReviewComponents";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flex: "1 0 auto",
    margin: "auto",
    maxWidth: 960,
    marginTop: 40,
    marginBottom: 40,
    height: "50%",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: 0,
      marginBottom: 24,
    },
  },
  loadedCard: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 0,
    },
  },
  loadingCard: {
    justifyContent: "center",
    alignItems: "center",
  },
  alert: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  titleAbstract: {
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
  note: {
    justifyContent: "flex-end",
  },
}));

const RecordCard = (props) => {
  const classes = useStyles();

  const isDebugInclusion = () => {
    if (props.record) {
      return props.record._debug_label === 1;
    }
  };

  const expandNoteSheet = () => {
    props.setRecordNote((s) => {
      return {
        ...s,
        expand: true,
        shrink: false,
      };
    });
  };

  const shrinkNoteSheet = () => {
    props.setRecordNote((s) => {
      return {
        ...s,
        shrink: true,
      };
    });
  };

  const onChangeNote = (event) => {
    props.setRecordNote({
      ...props.recordNote,
      data: event.target.value,
    });
  };

  const discardNote = () => {
    props.setRecordNote((s) => {
      return {
        ...s,
        expand: false,
        data: null,
      };
    });
  };

  const saveNote = () => {
    props.setRecordNote((s) => {
      return {
        ...s,
        expand: false,
        saved: true,
      };
    });
  };

  return (
    <Box className={classes.root} aria-label="record card container">
      {!props.isloaded && (
        <Card className={clsx(classes.loadedCard, classes.loadingCard)}>
          <CardContent aria-label="record loading">
            <CircularProgress />
          </CardContent>
        </Card>
      )}
      {props.isloaded && (
        <Card className={classes.loadedCard} aria-label="record card">
          {/* Previous decision alert */}
          {isDebugInclusion() && (
            <Box aria-label="pre-labeled record alert">
              <Alert className={classes.alert} severity="info">
                This record was pre-labeled as relevant.
              </Alert>
            </Box>
          )}

          <CardContent
            className={classes.titleAbstract}
            aria-label="record title abstract"
          >
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
            {!(props.record.doi === undefined || props.record.doi === null) && (
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
              className={classes.abstract + " fontSize" + props.fontSize.label}
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

          <Slide
            direction="up"
            in={props.recordNote.expand}
            onExited={shrinkNoteSheet}
            mountOnEnter
            unmountOnExit
          >
            <Box>
              <NoteSheet
                note={props.recordNote["data"]}
                discardNote={discardNote}
                saveNote={saveNote}
                onChangeNote={onChangeNote}
              />
            </Box>
          </Slide>

          {props.recordNote.shrink && (
            <CardActions className={classes.note}>
              <Button
                color="primary"
                size="small"
                onClick={expandNoteSheet}
                aria-label="add note"
              >
                {props.recordNote["data"] ? "Edit Note" : "Add Note"}
              </Button>
            </CardActions>
          )}
        </Card>
      )}
    </Box>
  );
};

export default RecordCard;
