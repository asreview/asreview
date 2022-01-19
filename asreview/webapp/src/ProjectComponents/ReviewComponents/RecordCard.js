import React from "react";
import clsx from "clsx";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { BoxErrorHandler } from "../../Components";
import { NoteSheet } from "../ReviewComponents";
import { ExplorationModeRecordAlert } from "../../StyledComponents/StyledAlert.js";

const PREFIX = "RecordCard";

const classes = {
  loadedCard: `${PREFIX}-loadedCard`,
  loadingCard: `${PREFIX}-loadingCard`,
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
  padding: "24px 0px 32px 0px",
  height: "100%",
  [theme.breakpoints.down("md")]: {
    padding: "4px 0px",
  },
  [`& .${classes.loadedCard}`]: {
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    [theme.breakpoints.down("md")]: {
      borderRadius: 0,
    },
  },

  [`& .${classes.loadingCard}`]: {
    justifyContent: "center",
    alignItems: "center",
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
    if (props.activeRecord) {
      return props.activeRecord._debug_label === 1;
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

  return (
    <Root aria-label="record card">
      {!props.isError && !props.activeRecord && (
        <Card
          elevation={2}
          className={clsx(classes.loadedCard, classes.loadingCard)}
        >
          <CardContent aria-label="record loading">
            <CircularProgress />
          </CardContent>
        </Card>
      )}
      {props.isError && (
        <Card
          elevation={2}
          className={clsx(classes.loadedCard, classes.loadingCard)}
          aria-label="record loaded failure"
        >
          <BoxErrorHandler queryKey="fetchRecord" error={props.error} />
        </Card>
      )}
      {props.activeRecord && (
        <Card
          elevation={2}
          className={classes.loadedCard}
          aria-label="record loaded"
        >
          {/* Previous decision alert */}
          {isDebugInclusion() && <ExplorationModeRecordAlert />}

          <CardContent
            className={classes.titleAbstract}
            aria-label="record title abstract"
          >
            {/* Show the title */}
            <Typography
              className={classes.title}
              variant="h5"
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
                  No title available.
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
                <Box fontStyle="italic">No abstract available.</Box>
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
                note={props.recordNote.data}
                noteFieldAutoFocus={props.noteFieldAutoFocus}
                previousRecord={props.previousRecord}
                setRecordNote={props.setRecordNote}
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
                {props.previousRecord.show && props.previousRecord.note
                  ? "Edit Note"
                  : "Add Note"}
              </Button>
            </CardActions>
          )}
        </Card>
      )}
    </Root>
  );
};

export default RecordCard;
