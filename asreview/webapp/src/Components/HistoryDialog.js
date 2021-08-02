import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  List,
  Typography,
  useMediaQuery,
} from "@material-ui/core";

import { makeStyles, useTheme } from "@material-ui/core/styles";

import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";

import { AppBarWithinDialog } from "../Components";
import { HistoryListCard } from "../Components";
import ErrorHandler from "../ErrorHandler";

import { ProjectAPI } from "../api/index.js";

import { mapStateToProps } from "../globals.js";

import { connect } from "react-redux";

const DEFAULT_SELECTION = 1;

const selectOptions = [
  {
    value: 1,
    label: "All",
  },
  {
    value: 2,
    label: "Relevant",
  },
  {
    value: 3,
    label: "Irrelevant",
  },
];

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 0,
  },
  record: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  action: {
    padding: 24,
    justifyContent: "flex-start",
  },
}));

const HistoryDialog = (props) => {
  const classes = useStyles();

  const descriptionElementRef = useRef(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [state, setState] = useState({
    select: DEFAULT_SELECTION,
    data: null,
  });

  // second layer record state
  const [record, setRecord] = useState({
    index: null,
    converted: false,
  });

  const [error, setError] = useState({
    code: null,
    message: null,
  });

  const handleSelectChange = (event) => {
    setState({ ...state, select: event.target.value });
  };

  // second layer record toggle
  const toggleRecord = (index) => {
    if (record.index === null) {
      setRecord((s) => {
        return {
          ...s,
          index: index,
        };
      });
    } else {
      setRecord((s) => {
        return {
          ...s,
          index: null,
        };
      });
    }
  };

  const exitReviewHistory = () => {
    setRecord({
      index: null,
      converted: false,
    });
  };

  // change decision of labeled records
  const updateInstance = (doc_id, label) => {
    // set up the form
    let body = new FormData();
    body.set("doc_id", doc_id);
    body.set("label", label === 1 ? 0 : 1);

    ProjectAPI.classify_instance(props.project_id, doc_id, body, false)
      .then((response) => {
        setRecord((s) => {
          return {
            ...s,
            converted: true,
          };
        });
        console.log(
          `${props.project_id} - add item ${doc_id} to ${
            label === 1 ? "exclusions" : "inclusions"
          }`
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const reloadReviewHistory = useCallback(() => {
    ProjectAPI.prior(props.project_id)
      .then((result) => {
        setState((s) => {
          return {
            ...s,
            data: result.data["result"].reverse(),
          };
        });
        setRecord((s) => {
          return {
            ...s,
            converted: false,
          };
        });
      })
      .catch((error) => {
        setError({
          code: error.code,
          message: error.message,
        });
      });
  }, [props.project_id]);

  // refresh after toggle the dialog
  useEffect(() => {
    if (props.project_id !== null && props.history) {
      reloadReviewHistory();
    }
  }, [reloadReviewHistory, props.project_id, props.history, error.message]);

  // refresh after decision change
  useEffect(() => {
    if (record.converted) {
      reloadReviewHistory();
    }
  }, [reloadReviewHistory, record.converted]);

  useEffect(() => {
    if (props.history) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.history]);

  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={props.history}
        onClose={props.toggleHistory}
        onExited={exitReviewHistory}
        scroll="paper"
        fullWidth={true}
        maxWidth={"md"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        PaperProps={{
          style: { height: "inherit" },
        }}
      >
        {record.index === null && (
          <AppBarWithinDialog
            onClickStartIcon={props.toggleHistory}
            selectedValue={state["select"]}
            onChangeSelect={handleSelectChange}
            selectOptions={selectOptions}
          />
        )}

        {record.index !== null && (
          <AppBarWithinDialog
            startIconIsClose={false}
            onClickStartIcon={toggleRecord}
          />
        )}

        {error.message !== null && (
          <DialogContent className={classes.root}>
            <ErrorHandler error={error} setError={setError} />
          </DialogContent>
        )}

        {error.message === null && record.index === null && (
          <DialogContent className={classes.root}>
            {state["data"] !== null && state["select"] === 1 && (
              <List>
                {state["data"].map((value, index) => {
                  return (
                    <HistoryListCard
                      value={value}
                      index={index}
                      handleClick={toggleRecord}
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
                        handleClick={toggleRecord}
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
                        handleClick={toggleRecord}
                        key={`result-item-${value.id}`}
                      />
                    );
                  } else {
                    return null;
                  }
                })}
              </List>
            )}
          </DialogContent>
        )}

        {error.message === null && record.index !== null && (
          <DialogContent className={classes.record}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {state.data[record.index].title}
              </Typography>

              {(state.data[record.index].abstract === "" ||
                state.data[record.index].abstract === null) && (
                <Box fontStyle="italic">
                  <Typography gutterBottom>
                    This record doesn't have an abstract.
                  </Typography>
                </Box>
              )}

              {!(
                state.data[record.index].abstract === "" ||
                state.data[record.index].abstract === null
              ) && <Typography>{state.data[record.index].abstract}</Typography>}
            </Box>
          </DialogContent>
        )}

        {record.index !== null && (
          <DialogActions className={classes.action}>
            <div>
              <Chip
                icon={
                  state.data[record.index].included === 1 ? (
                    <FavoriteIcon fontSize="small" />
                  ) : (
                    <FavoriteBorderIcon fontSize="small" />
                  )
                }
                label={
                  state.data[record.index].included === 1
                    ? "Convert to irrelevant"
                    : "Convert to relevant"
                }
                onClick={() => {
                  updateInstance(
                    state.data[record.index].id,
                    state.data[record.index].included
                  );
                }}
                variant="outlined"
              />
            </div>
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
};

export default connect(mapStateToProps)(HistoryDialog);
