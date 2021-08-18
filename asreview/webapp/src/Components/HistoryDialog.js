import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
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
  container: {
    "& > *": {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  },
  record: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  action: {
    padding: "32px 24px 24px 24px",
    justifyContent: "flex-start",
  },
  chip: {
    marginLeft: "auto",
  },
  circularProgress: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    data: null,

    converting: false,
    converted: 0,
  });

  const [error, setError] = useState({
    code: null,
    message: null,
  });

  const handleSelectChange = (event) => {
    setState((s) => {
      return {
        ...s,
        select: event.target.value,
      };
    });
  };

  // second layer record toggle
  const toggleRecord = (event, index) => {
    event.preventDefault();
    if (record.index === null) {
      setRecord((s) => {
        return {
          ...s,
          index: index,
          data: state.data[index],
        };
      });
    } else {
      setRecord({
        index: null,
        data: null,
        converting: false,
        converted: 0,
      });
    }
  };

  const exitReviewHistory = () => {
    setRecord({
      index: null,
      data: null,
      converting: false,
      converted: 0,
    });
  };

  // change decision of labeled records
  const updateInstance = (doc_id, label) => {
    setRecord((s) => {
      return {
        ...s,
        converting: true,
      };
    });

    // set up the form
    let body = new FormData();
    body.set("doc_id", doc_id);
    body.set("label", label === 1 ? 0 : 1);

    ProjectAPI.classify_instance(props.project_id, doc_id, body, false)
      .then((response) => {
        loadReviewHistory();
        setTimeout(
          () => {
            setRecord((s) => {
              return {
                ...s,
                converting: false,
                converted: record.converted + 1,
              };
            });
          },
          record.converted % 2 === 0 ? 1500 : 0
        );
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

  const loadReviewHistory = useCallback(() => {
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
  }, [props.project_id]);

  // refresh after toggle the dialog
  useEffect(() => {
    if (props.project_id !== null && props.history) {
      loadReviewHistory();
    }
  }, [loadReviewHistory, props.project_id, props.history, error.message]);

  useEffect(() => {
    if (props.history) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.history]);

  let convertLabel = record.data
    ? record.data.included === 1
      ? "Convert to irrelevant"
      : "Convert to relevant"
    : "";

  let convertColor = record.data
    ? record.data.included === 1
      ? "secondary"
      : "default"
    : "";

  if (record.converting && record.data) {
    if (record.converted % 2 === 0) {
      convertLabel =
        record.data.included === 1
          ? "Converting to irrelevant"
          : "Converting to relevant";
      convertColor = record.data.included === 1 ? "secondary" : "default";
    }
  } else {
    if (record.converted && record.converted % 2 !== 0) {
      convertLabel =
        state.data[0].included === 0
          ? "Converted to irrelevant"
          : "Converted to relevant";
      convertColor = state.data[0].included === 0 ? "default" : "secondary";
    }
  }

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
            {!state.data && (
              <div className={classes.circularProgress}>
                <CircularProgress />
              </div>
            )}
            {state["data"] !== null && state["select"] === 1 && (
              <Container className={classes.container}>
                {state["data"].map((value, index) => {
                  return (
                    <HistoryListCard
                      value={value}
                      index={index}
                      handleClick={toggleRecord}
                      updateInstance={updateInstance}
                      key={`result-item-${value.id}`}
                    />
                  );
                })}
              </Container>
            )}
            {state["data"] !== null && state["select"] === 2 && (
              <Container className={classes.container}>
                {state["data"].map((value, index) => {
                  if (value.included === 1) {
                    return (
                      <HistoryListCard
                        value={value}
                        index={index}
                        handleClick={toggleRecord}
                        updateInstance={updateInstance}
                        key={`result-item-${value.id}`}
                      />
                    );
                  } else {
                    return null;
                  }
                })}
              </Container>
            )}
            {state["data"] !== null && state["select"] === 3 && (
              <Container className={classes.container}>
                {state["data"].map((value, index) => {
                  if (value.included !== 1) {
                    return (
                      <HistoryListCard
                        value={value}
                        index={index}
                        handleClick={toggleRecord}
                        updateInstance={updateInstance}
                        key={`result-item-${value.id}`}
                      />
                    );
                  } else {
                    return null;
                  }
                })}
              </Container>
            )}
          </DialogContent>
        )}

        {error.message === null && record.index !== null && (
          <DialogContent className={classes.record}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {record.data.title}
              </Typography>

              {(record.data.abstract === "" ||
                record.data.abstract === null) && (
                <Box fontStyle="italic">
                  <Typography gutterBottom>
                    This record doesn't have an abstract.
                  </Typography>
                </Box>
              )}

              {!(
                record.data.abstract === "" || record.data.abstract === null
              ) && <Typography>{record.data.abstract}</Typography>}
            </Box>
          </DialogContent>
        )}

        {error.message === null && record.index !== null && (
          <DialogActions className={classes.action}>
            <div className={classes.chip}>
              <Chip
                disabled={record.converting}
                color={convertColor}
                icon={
                  record.converting && record.converted % 2 === 0 ? (
                    <CircularProgress size="1rem" thickness={5} />
                  ) : state.data[record.converted ? 0 : record.index]
                      .included === 1 ? (
                    <FavoriteIcon fontSize="small" />
                  ) : (
                    <FavoriteBorderIcon fontSize="small" />
                  )
                }
                label={convertLabel}
                onClick={() => {
                  updateInstance(
                    state.data[record.converted ? 0 : record.index].id,
                    state.data[record.converted ? 0 : record.index].included
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
