import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  List,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import FavoriteIcon from "@material-ui/icons/Favorite";
import CloseIcon from "@material-ui/icons/Close";

import { HistoryListCard } from "../Components";
import ErrorHandler from "../ErrorHandler";

import { ProjectAPI } from "../api/index.js";

import { mapStateToProps } from "../globals.js";

import { connect } from "react-redux";

const DEFAULT_SELECTION = 1;

const useStyles = makeStyles((theme) => ({
  selectMenu: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(2),
    minWidth: 130,
  },
  backButton: {
    position: "absolute",
    left: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  detailTitle: {
    position: "relative",
    marginLeft: "36px",
  },
  recordLabelAction: {
    flex: "auto",
    padding: "6px 8px",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
  recordLabelActionText: {
    paddingRight: "4px",
  },
}));

const HistoryDialog = (props) => {
  const classes = useStyles();

  const [state, setState] = useState({
    select: DEFAULT_SELECTION,
    data: null,
    index: null,
  });

  const [error, setError] = useState({
    code: null,
    message: null,
  });

  // filter all records
  const handleSelectChange = (event) => {
    setState({ ...state, select: event.target.value });
  };

  // click to fold/unfold abstract and decision button
  const openRecord = (index) => {
    setState((s) => {
      return {
        ...s,
        index: index,
      };
    });
  };

  const reloadHistory = () => {
    setState({
      select: state.select,
      data: null,
      index: null,
    });
  };

  const closeHistory = () => {
    reloadHistory();
    props.toggleHistory();
  };

  // change decision of labeled records
  const updateInstance = (doc_id, label) => {
    // set up the form
    let body = new FormData();
    body.set("doc_id", doc_id);
    body.set("label", label === 1 ? 0 : 1);

    ProjectAPI.classify_instance(props.project_id, doc_id, body, false)
      .then((response) => {
        console.log(
          `${props.project_id} - add item ${doc_id} to ${
            label === 1 ? "exclusions" : "inclusions"
          }`
        );
        reloadHistory();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const descriptionElementRef = useRef(null);
  useEffect(() => {
    if (props.history) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.history]);

  // refresh after toggle the dialog and change a decision
  useEffect(() => {
    if (props.project_id !== null && props.history && state["data"] === null) {
      ProjectAPI.prior(props.project_id)
        .then((result) => {
          setState((s) => {
            return {
              ...s,
              data: result.data["result"].reverse(),
            };
          });
        })
        .catch((error) => {
          setError({
            code: error.code,
            message: error.message,
          });
        });
    }
  }, [props.project_id, props.history, state, error.message]);

  return (
    <Dialog
      open={props.history}
      onClose={closeHistory}
      scroll="paper"
      fullWidth={true}
      maxWidth={"md"}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
    >
      {state.index === null && (
        <DialogTitle>
          Review History
          {state["data"] !== null && (
            <FormControl className={classes.selectMenu}>
              <Select value={state.select} onChange={handleSelectChange}>
                <MenuItem value={1}>All ({state["data"].length})</MenuItem>
                <MenuItem value={2}>
                  Relevant (
                  {state["data"].filter((value) => value.included === 1).length}
                  )
                </MenuItem>
                <MenuItem value={3}>
                  Irrelevant (
                  {state["data"].filter((value) => value.included !== 1).length}
                  )
                </MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogTitle>
      )}

      {state.index !== null && (
        <DialogTitle>
          <IconButton
            aria-label="back"
            className={classes.backButton}
            onClick={reloadHistory}
          >
            <ArrowBackIcon />
          </IconButton>
          <div className={classes.detailTitle}>Overview</div>
        </DialogTitle>
      )}

      {error.message !== null && (
        <DialogContent dividers={true}>
          <ErrorHandler error={error} setError={setError} />
        </DialogContent>
      )}

      {error.message === null && state.index === null && (
        <DialogContent dividers={true}>
          <Box>
            {state["data"] !== null && state["select"] === 1 && (
              <List>
                {state["data"].map((value, index) => {
                  return (
                    <HistoryListCard
                      value={value}
                      index={index}
                      handleClick={openRecord}
                      key={`result-item-${value.id}`}
                    />
                  );
                })}
              </List>
            )}
            {state["data"] !== null && state["select"] === 2 && (
              <List>
                {state["data"].map((value, index) => {
                  if (value.included === 1) {
                    return (
                      <HistoryListCard
                        value={value}
                        index={index}
                        handleClick={openRecord}
                        key={`result-item-${value.id}`}
                      />
                    );
                  } else {
                    return null;
                  }
                })}
              </List>
            )}
            {state["data"] !== null && state["select"] === 3 && (
              <List>
                {state["data"].map((value, index) => {
                  if (value.included !== 1) {
                    return (
                      <HistoryListCard
                        value={value}
                        index={index}
                        handleClick={openRecord}
                        key={`result-item-${value.id}`}
                      />
                    );
                  } else {
                    return null;
                  }
                })}
              </List>
            )}
          </Box>
        </DialogContent>
      )}

      {error.message === null && state.index !== null && (
        <DialogContent dividers={true}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {state.data[state.index].title}
            </Typography>

            {(state.data[state.index].abstract === "" ||
              state.data[state.index].abstract === null) && (
              <Box fontStyle="italic">
                <Typography gutterBottom>
                  This record doesn't have an abstract.
                </Typography>
              </Box>
            )}

            {!(
              state.data[state.index].abstract === "" ||
              state.data[state.index].abstract === null
            ) && <Typography>{state.data[state.index].abstract}</Typography>}
          </Box>
        </DialogContent>
      )}

      <DialogActions>
        {state.index !== null && (
          <Box className={classes.recordLabelAction}>
            <Typography className={classes.recordLabelActionText}>
              {state.data[state.index].included === 1
                ? "Relevant"
                : "Irrelevant"}
            </Typography>
            {state.data[state.index].included === 1 ? (
              <FavoriteIcon color="secondary" />
            ) : (
              <CloseIcon />
            )}
          </Box>
        )}
        {state.index === null && <Button onClick={closeHistory}>Close</Button>}
        {state.index !== null && (
          <Button
            onClick={() => {
              updateInstance(
                state.data[state.index].id,
                state.data[state.index].included
              );
            }}
          >
            {state.data[state.index].included === 1
              ? "Convert to IRRELEVANT"
              : "Convert to RELEVANT"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default connect(mapStateToProps)(HistoryDialog);
