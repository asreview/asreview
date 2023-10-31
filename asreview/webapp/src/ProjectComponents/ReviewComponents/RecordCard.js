import React, { useState } from "react";
import clsx from "clsx";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Slide,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link } from "@mui/icons-material";

import { BoxErrorHandler } from "../../Components";
import { DOIIcon } from "../../icons";
import { NoteSheet } from "../ReviewComponents";
import { ExplorationModeRecordAlert } from "../../StyledComponents/StyledAlert.js";
import { StyledIconButton } from "../../StyledComponents/StyledButton.js";

const PREFIX = "RecordCard";

const classes = {
  loadedCard: `${PREFIX}-loadedCard`,
  loadingCard: `${PREFIX}-loadingCard`,
  titleAbstract: `${PREFIX}-titleAbstract`,
  title: `${PREFIX}-title`,
  abstract: `${PREFIX}-abstract`,
  note: `${PREFIX}-note`,
};

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 0 auto",
  margin: "auto",
  maxWidth: 960,
  padding: "64px 0px 32px 0px",
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

  const [highlightRegex, setHighlightRegex] = useState('');

  const highlightWithRegex = (text, regexStr) => {
    try {
      const regex = new RegExp(regexStr, 'gi');
      const hasGroups = /\((?!\?:)/.test(regexStr); // Test for capturing groups
  
      if (hasGroups) {
        return text.replace(regex, (match, ...groups) => {
          let offset = 0;
          let highlighted = match;
          
          // Remove the last two elements (entire string and index)
          groups.pop();
          groups.pop();
  
          for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            if (group === undefined) continue;
  
            let color;
            if (i === 0) color = '#affaaf'; // Green
            else if (i === 1) color = '#FFCCCC'; // Red
            else color = 'lightblue'; // Blue
  
            const startIdx = highlighted.indexOf(group, offset);
            const endIdx = startIdx + group.length;
            
            highlighted = (
              highlighted.substring(0, startIdx) +
              `<span style="background-color: ${color}">${group}</span>` +
              highlighted.substring(endIdx)
            );
  
            // Update offset
            offset = startIdx + `<span style="background-color: ${color}">${group}</span>`.length;
          }
  
          return highlighted;
        });
      } else {
        return text.replace(regex, (match) => `<span style="background-color: yellow">${match}</span>`);
      }
    } catch (e) {
      // Handle regex errors by returning the text in red
      return `<span style="color: red">${text}</span>`;
    }    
  };
  
  return (
    <Root aria-label="record card">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
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
        <div style={{ flex: 1 }}>
          {props.activeRecord && (
            <Card
              elevation={2}
              className={classes.loadedCard}
              aria-label="record loaded"
            >
              {/* Previous decision alert */}
              {props.activeRecord._debug_label !== null && (
                <ExplorationModeRecordAlert
                  label={!isDebugInclusion() ? "irrelevant" : "relevant"}
                />
              )}

              <CardContent
                className={`${classes.titleAbstract} record-card-content`}
                aria-label="record title abstract"
              >
                <Stack spacing={1}>
                  {/* Show the title */}
                  <Typography
                    component="div"
                    className={classes.title}
                    variant={!props.mobileScreen ? "h5" : "h6"}
                    sx={{
                      fontWeight: (theme) => theme.typography.fontWeightRegular,
                    }}
                  >
                    {/* No title, inplace text */}
                    {(props.activeRecord.title === "" ||
                      props.activeRecord.title === null) && (
                      <Box
                        className={"fontSize" + props.fontSize.label}
                        fontStyle="italic"
                      >
                        No title available
                      </Box>
                    )}

                    {/* Show the title if available */}
                    {!(
                      props.activeRecord.title === "" ||
                      props.activeRecord.title === null
                    ) && (
                      <Box className={"fontSize" + props.fontSize.label}>
                        {props.activeRecord.title}
                      </Box>
                    )}
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    {/* Show DOI if available */}
                    {!(
                      props.activeRecord.doi === undefined ||
                      props.activeRecord.doi === null
                    ) && (
                      <StyledIconButton
                        className="record-card-icon"
                        href={"https://doi.org/" + props.activeRecord.doi}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <DOIIcon />
                      </StyledIconButton>
                    )}

                    {/* Show URL if available */}
                    {!(
                      props.activeRecord.url === undefined ||
                      props.activeRecord.url === null
                    ) && (
                      <Tooltip title="Open URL">
                        <StyledIconButton
                          className="record-card-icon"
                          href={props.activeRecord.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Link />
                        </StyledIconButton>
                      </Tooltip>
                    )}
                  </Stack>
                  {/* Show the abstract */}
                  <Typography
                    component="div"
                    className={
                      classes.abstract + " fontSize" + props.fontSize.label
                    }
                    variant="body2"
                    paragraph
                    sx={{ color: "text.secondary" }}
                  >
                    {/* No abstract, inplace text */}
                    {(props.activeRecord.abstract === "" ||
                      props.activeRecord.abstract === null) && (
                      <Box fontStyle="italic">No abstract available</Box>
                    )}

                    {/* Show the abstract if available */}
                    {!(
                      props.activeRecord.abstract === "" ||
                      props.activeRecord.abstract === null
                    ) && <Box 
                    dangerouslySetInnerHTML={{
                      __html: highlightWithRegex(props.activeRecord.abstract, highlightRegex)
                    }}
                  />
                      }
                  </Typography>
                </Stack>
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
                    disabled={props.disableButton()}
                    size="small"
                    onClick={expandNoteSheet}
                    aria-label="add note"
                  >
                    {(props.previousRecord.show && props.previousRecord.note) ||
                    props.recordNote.data
                      ? "Edit Note"
                      : "Add Note"}
                  </Button>
                </CardActions>
              )}
            </Card>
          )}
        </div>
          <div style={{ flex: 1, paddingTop: '16px' }}>
            <Card elevation={2} className={classes.loadedCard} aria-label="regex card">
              <CardContent>
                <Typography
                  component="div"
                  className={classes.title}
                  variant={!props.mobileScreen ? "h5" : "h6"}
                  sx={{
                    fontWeight: (theme) => theme.typography.fontWeightRegular,
                  }}
                >
                  Regex to Highlight
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={highlightRegex}
                  onChange={(e) => setHighlightRegex(e.target.value)}
                  placeholder="Enter regex pattern to highlight"
                  style={{ margin: '8px 0' }}
                />
              </CardContent>
            </Card>
          </div>
      </div>
    </Root>
  );
};

export default RecordCard;
