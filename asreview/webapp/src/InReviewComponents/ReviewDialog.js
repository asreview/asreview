import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Dialog,
  DialogContent,
  DialogActions,
  useMediaQuery,
} from "@material-ui/core";

import { AppBarWithinDialog } from "../Components";
import {
  DecisionButton,
  DecisionUndoBar,
  ExplorationModeBanner,
  RecordCard,
  StatsSheet,
} from "../InReviewComponents";
import ErrorHandler from "../ErrorHandler";
import { useKeyPress } from "../hooks/useKeyPress";

import { ProjectAPI } from "../api/index.js";

import { connect } from "react-redux";

import { statsSheetWidth } from "../globals.js";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  box: {
    paddingBottom: 30,
    overflowY: "auto",
  },
  content: {
    flexGrow: 1,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: 0,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: statsSheetWidth,
  },
  link: {
    paddingLeft: "3px",
  },
}));

const mapStateToProps = (state) => {
  return {
    project_id: state.project_id,
  };
};

const ReviewDialog = (props) => {
  const classes = useStyles();
  const theme = useTheme();
  const mobile = !useMediaQuery(theme.breakpoints.up("sm"));

  /**
   * Exploration mode banner state
   */
  const [explorationMode, setExplorationMode] = useState(false);
  const [banner, setBanner] = useState(false);

  /**
   * Record state
   */
  const [recordState, setRecordState] = useState({
    isloaded: false,
    record: null,
    selection: null,
  });
  const [previousRecordState, setPreviousRecordState] = useState({
    record: null,
    decision: null,
  });
  const [error, setError] = useState({
    code: null,
    message: null,
  });

  /**
   * Side statistics state
   */
  const [sideSheet, setSideSheet] = useState(true);
  const [sideSheetError, setSideSheetError] = useState(false);
  const [statistics, setStatistics] = useState({
    name: null,
    authors: null,
    decsription: null,
    n_included: null,
    n_excluded: null,
    n_since_last_inclusion: null,
    n_papers: null,
    n_pool: null,
  });

  /**
   * Review history state
   */
  const [history, setHistory] = useState([]);

  /**
   * Undo bar state
   */
  const [undoState, setUndoState] = useState({
    open: false,
    message: null,
  });

  /**
   * Keyboard shortcuts hooks
   */
  const relevantPress = useKeyPress("r");
  const irrelevantPress = useKeyPress("i");
  const undoPress = useKeyPress("u");

  /**
   * Current record state change
   */
  const startLoadingNewDocument = () => {
    setRecordState({
      isloaded: false,
      record: null,
      selection: null,
    });
  };
  const loadPreviousRecordState = () => {
    setRecordState({
      isloaded: true,
      record: previousRecordState.record,
      selection: previousRecordState.decision,
    });
  };

  /**
   * Previous record state change
   */
  const storeRecordState = (label) => {
    setPreviousRecordState({
      record: recordState.record,
      decision: label,
    });
  };
  const resetPreviousRecordState = () => {
    setPreviousRecordState({
      record: null,
      decision: null,
    });
  };

  /**
   * Side statistics toggle
   */
  const toggleSideSheet = () => {
    setSideSheet((a) => !a);
  };

  /**
   * Undo bar handler
   */
  const showUndoBar = (message) => {
    setUndoState({
      open: true,
      message: message,
    });
  };
  const showUndoBarIfNeeded = (label, initial) => {
    if (props.undoEnabled) {
      const mark = label === 0 ? "irrelevant" : "relevant";
      const message = `${initial ? "Marked as" : "Converted to"} ${mark}`;
      showUndoBar(message);
    }
  };
  const closeUndoBar = () => {
    setUndoState({
      open: false,
      message: null,
    });
  };

  /**
   * Change a decision or not in undo mode
   */
  const isUndoModeActive = () => {
    return recordState.record.doc_id === previousRecordState["record"]?.doc_id;
  };
  const needsClassification = (label) => {
    if (!isUndoModeActive()) {
      return true;
    }
    return label !== previousRecordState.decision;
  };
  const skipClassification = () => {
    resetPreviousRecordState();
    startLoadingNewDocument();
  };

  /**
   * Make or undo a decision
   */
  const makeDecision = (label) => {
    closeUndoBar(); // hide potentially active undo bar
    if (!needsClassification(label)) {
      skipClassification();
    } else {
      classifyInstance(label, !isUndoModeActive());
    }
    storeRecordState(label);
  };
  const undoDecision = () => {
    closeUndoBar();
    loadPreviousRecordState();
  };

  /**
   * Include (accept) or exclude (reject) current article
   *
   * @param label  1=include, 0=exclude
   * @param initial   true=initial classification, false=update previous classification
   */
  const classifyInstance = (label, initial) => {
    // set up the form
    let body = new FormData();
    body.set("doc_id", recordState["record"].doc_id);
    body.set("label", label);

    ProjectAPI.classify_instance(
      props.project_id,
      recordState.record.doc_id,
      body,
      initial
    )
      .then((response) => {
        console.log(
          `${props.project_id} - add item ${recordState["record"].doc_id} to ${
            label ? "inclusions" : "exclusions"
          }`
        );
        startLoadingNewDocument();
        showUndoBarIfNeeded(label, initial);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const exitReviewDialog = () => {
    props.toggleReview();
    props.handleAppState("project-page");
  };

  useEffect(() => {
    /**
     * Get statistics for history dialog and side sheet
     */
    const getProgressInfo = () => {
      ProjectAPI.progress(props.project_id)
        .then((result) => {
          setStatistics(result.data);
        })
        .catch((error) => {
          setSideSheetError(true);
          console.log(error);
        });
    };

    const getProgressHistory = () => {
      ProjectAPI.progress_history(props.project_id)
        .then((result) => {
          setHistory(result.data);
        })
        .catch((error) => {
          setSideSheetError(true);
          console.log(error);
        });
    };

    /**
     * Get next record
     */
    const getDocument = () => {
      ProjectAPI.get_document(props.project_id)
        .then((result) => {
          /* Check for last paper */
          if (result.data["pool_empty"]) {
            props.handleAppState("review-complete");
          } else {
            /* New article found and set */
            setRecordState({
              record: result.data["result"],
              isloaded: true,
              selection: null,
            });
          }
        })
        .catch((error) => {
          setError({
            code: error.code,
            message: error.message,
          });
        });
    };

    if (!recordState["isloaded"]) {
      getDocument();
      getProgressInfo();
      getProgressHistory();
    }
  }, [props.project_id, recordState, props, error.message, sideSheetError]);

  /**
   * Display banner when in Exploration Mode
   */
  useEffect(() => {
    if (
      !explorationMode &&
      recordState.record &&
      recordState.record._debug_label !== null
    ) {
      setExplorationMode(true);
    }
  }, [explorationMode, recordState.record]);
  useEffect(() => {
    if (explorationMode) {
      setBanner(true);
    }
  }, [explorationMode]);

  /**
   * Hide side statistics on mobile screen
   */
  useEffect(() => {
    if (mobile) {
      setSideSheet(false);
    } else {
      setSideSheet(true);
    }
  }, [mobile]);

  /**
   * Use keyboard shortcuts
   */
  useEffect(() => {
    if (props.keyPressEnabled) {
      if (relevantPress && recordState.isloaded) {
        makeDecision(1);
      }
      if (irrelevantPress && recordState.isloaded) {
        makeDecision(0);
      }
      if (undoPress && undoState.open && props.undoEnabled) {
        undoDecision();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relevantPress, irrelevantPress, undoPress]);

  return (
    <div className={classes.root}>
      <Dialog
        fullScreen
        open={props.onReview}
        onClose={exitReviewDialog}
        scroll="paper"
      >
        <AppBarWithinDialog
          color="primary"
          startIconIsClose={false}
          onClickHistory={props.toggleHistory}
          onClickShowChart={toggleSideSheet}
          onClickStartIcon={exitReviewDialog}
        />

        {/* Banner Exploration Mode */}
        <div
          className={clsx(classes.content, {
            [classes.contentShift]: !mobile && sideSheet,
          })}
        >
          <ExplorationModeBanner banner={banner} setBanner={setBanner} />
        </div>

        {/* Article card */}
        <DialogContent
          style={{ height: "100%" }}
          className={clsx(classes.content, {
            [classes.contentShift]: !mobile && sideSheet,
          })}
        >
          <RecordCard
            record={recordState["record"]}
            isloaded={recordState["isloaded"]}
            fontSize={props.fontSize}
          />
        </DialogContent>

        {/* Decision button */}
        <DialogActions
          className={clsx(classes.content, {
            [classes.contentShift]: !mobile && sideSheet,
          })}
        >
          <DecisionButton
            makeDecision={makeDecision}
            mobile={mobile}
            previousSelection={recordState["selection"]}
          />
        </DialogActions>

        {/* Error Handler */}
        {error.message !== null && (
          <ErrorHandler error={error} setError={setError} />
        )}

        {/* Decision undo bar */}
        <div
          className={clsx(classes.content, {
            [classes.contentShift]: !mobile && sideSheet,
          })}
        >
          <DecisionUndoBar
            state={undoState}
            undo={undoDecision}
            close={closeUndoBar}
          />
        </div>

        {/* Statistics side sheet */}
        <StatsSheet
          mobile={mobile}
          onSideSheet={sideSheet}
          toggleSideSheet={toggleSideSheet}
          statistics={statistics}
          history={history}
          sideSheetError={sideSheetError}
          setSideSheetError={setSideSheetError}
        />
      </Dialog>
    </div>
  );
};

export default connect(mapStateToProps)(ReviewDialog);
