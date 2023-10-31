import React, { useState } from "react";
import clsx from "clsx";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Slide,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import SendIcon from '@mui/icons-material/Send';
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
  const [applyHighlightRegex, setApplyHighlightRegex] = useState('');
  const theme = useTheme();

  const highlightWithRegex = (text, regexStr) => {
    try {
      // Create a new RegExp object from the given regex string
      const regex = new RegExp(regexStr, 'gi');
      
      // Check if the regular expression contains capturing groups
      const hasGroups = /\((?!\?:)/.test(regexStr);
      
      // Initialize an empty array to hold the JSX elements
      const elements = [];
      
      // Initialize variable to keep track of last index
      let lastIndex = 0;
      
      // Initialize counter for React keys
      let keyCounter = 0;

      // Helper function to push a new span element to the elements array
      const pushElement = (content, style = {}) => {
        elements.push(<span key={keyCounter++} style={style}>{content}</span>);
      };

      // Set colors
      const green = theme.palette.mode === 'dark' ? '#2E7D32' : '#9de0a2';
      const red = theme.palette.mode === 'dark' ? '#C62828' : '#FFABAB';
      // const blue = theme.palette.mode === 'dark' ? '#1565C0' : '#A8DADC';
      const yellow = theme.palette.mode === 'dark' ? '#F9A825' : '#FFF5AB';      

      // Iterate over each match and its capturing groups
      text.replace(regex, (match, ...groups) => {
        // Find the index of the match
        const index = text.indexOf(match, lastIndex);
        
        // Push the preceding text that doesn't match the regex
        pushElement(text.slice(lastIndex, index));

        // If there are capturing groups, handle them
        if (hasGroups) {
          // Remove the last two items which are the entire string and index
          groups = groups.slice(0, -2);
          
          // Iterate over capturing groups
          groups.forEach((group, i) => {
            if (group !== undefined) {
              // Assign colors based on the capturing group index
              const color = i === 0 ? green : i === 1 ? red : yellow;
              pushElement(group, { backgroundColor: color });
            }
          });
        } else {
          // If no capturing groups, highlight the whole match
          pushElement(match, { backgroundColor: yellow });
        }

        // Update lastIndex for the next iteration
        lastIndex = index + match.length;
      });

      // Push remaining text that doesn't match the regex
      if (lastIndex < text.length) {
        pushElement(text.slice(lastIndex));
      }

      // Return the array of JSX elements
      return elements;

    } catch (e) {
      // If an error occurs (likely due to an invalid regex), return the text in red
      return [<span key="error">{text}</span>,
      <br key="br" />,<br key="br2" />,
      <span key="error message" style={{color: 'red'}}>{e.message}</span>
    ];
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
                    ) && <Box>
                    {highlightWithRegex(props.activeRecord.abstract, applyHighlightRegex)}
                  </Box>
                  
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
          {props.regexCardEnabled && (
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
                    Regex Highlighter
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={highlightRegex}
                    onChange={(e) => setHighlightRegex(e.target.value)}
                    placeholder="Enter regex pattern to highlight"
                    style={{ margin: '8px 0' }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="rerender text"
                            edge="end"
                            onClick={() => {setApplyHighlightRegex(highlightRegex)}}
                          >
                            <SendIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          )}
      </div>
    </Root>
  );
};

export default RecordCard;
