import React from "react";
import clsx from "clsx";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Slide,
  Typography,
  Link,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { NoteSheet } from "../ReviewComponents";

const PREFIX = "RecordCard";

const classes = {
  loadedCard: `${PREFIX}-loadedCard`,
  loadingCard: `${PREFIX}-loadingCard`,
  alert: `${PREFIX}-alert`,
  titleAbstract: `${PREFIX}-titleAbstract`,
  title: `${PREFIX}-title`,
  abstract: `${PREFIX}-abstract`,
  authors: `${PREFIX}-authors`,
  note: `${PREFIX}-note`,
};

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 0 auto",
  margin: "auto",
  maxWidth: 960,
  marginTop: 40,
  marginBottom: 40,
  height: "50%",
  width: "100%",
  [theme.breakpoints.down("md")]: {
    marginTop: 0,
    marginBottom: 24,
  },
  [`& .${classes.loadedCard}`]: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    [theme.breakpoints.down("md")]: {
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 0,
    },
  },

  [`& .${classes.loadingCard}`]: {
    justifyContent: "center",
    alignItems: "center",
  },

  [`& .${classes.alert}`]: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },

  [`& .${classes.titleAbstract}`]: {
    height: "100%",
    overflowY: "scroll",
  },

  [`& .${classes.title}`]: {
    lineHeight: 1.2,
  },

  [`& .${classes.abstract}`]: {
    whiteSpace: "pre-line",
  },

  [`& .${classes.authors}`]: {
    fontWeight: "bolder",
  },

  [`& .${classes.note}`]: {
    justifyContent: "flex-end",
  },
}));

const RecordCard = (props) => {
  const isDebugInclusion = () => {
    if (props.recordQuery.data.result) {
      return props.recordQuery.data.result._debug_label === 1;
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
    <Root aria-label="record card">
      {!props.activeRecord && (
        <Card className={clsx(classes.loadedCard, classes.loadingCard)}>
          <CardContent aria-label="record loading">
            <CircularProgress />
          </CardContent>
        </Card>
      )}
      {props.activeRecord && (
        <Card
          elevation={2}
          className={classes.loadedCard}
          aria-label="record card"
        >
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
              {(props.activeRecord.title === "" ||
                props.activeRecord.title === null) && (
                <Box
                  className={"fontSize" + props.fontSize.label}
                  fontStyle="italic"
                >
                  This document doesn't have a title.
                </Box>
              )}

              {/* No title, inplace text */}
              {!(
                props.activeRecord.title === "" ||
                props.activeRecord.title === null
              ) && (
                <Box className={"fontSize" + props.fontSize.label}>
                  {props.activeRecord.title}
                </Box>
              )}
            </Typography>

            {/* Show the publication date if available */}
            {!(
              props.activeRecord.doi === undefined ||
              props.activeRecord.doi === null
            ) && (
              <Typography
                className={classes.doi + " fontSize" + props.fontSize.label}
                color="textSecondary"
                component="p"
                fontStyle="italic"
                paragraph
              >
                DOI:{" "}
                <Link
                  href={"https://doi.org/" + props.activeRecord.doi}
                  target="_blank"
                  rel="noreferrer"
                >
                  {props.activeRecord.doi}
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
              {(props.activeRecord.abstract === "" ||
                props.activeRecord.abstract === null) && (
                <Box fontStyle="italic">
                  This document doesn't have an abstract.
                </Box>
              )}

              {/* No abstract, inplace text */}
              {!(
                props.activeRecord.abstract === "" ||
                props.activeRecord.abstract === null
              ) && <Box>{props.activeRecord.abstract}</Box>}
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
    </Root>
  );
};

export default RecordCard;
