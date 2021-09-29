import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import {
  DecisionButton,
  DecisionUndoBar,
  ExplorationModeBanner,
  RecordCard,
} from "../ReviewComponents";
import ErrorHandler from "../../ErrorHandler";

import { ProjectAPI } from "../../api/index.js";
import { useKeyPress } from "../../hooks/useKeyPress";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
}));

const mapStateToProps = (state) => {
  return {
    project_id: state.project_id,
  };
};

const ReviewPage = (props) => {
  const classes = useStyles();

  /**
   * Exploration mode banner state
   */
  const [explorationMode, setExplorationMode] = useState(false);

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
   * Record note state
   */
  const [recordNote, setRecordNote] = useState({
    expand: false,
    shrink: true,
    saved: false,
    data: null,
  });

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
  const notePress = useKeyPress("n");

  /**
   * Current record state change
   */
  const startLoadingNewDocument = () => {
    setRecordState({
      isloaded: false,
      record: null,
      selection: null,
    });
    setRecordNote({
      expand: false,
      shrink: true,
      saved: true,
      data: null,
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

  useEffect(() => {
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
    }
  }, [props.project_id, recordState, props, error.message]);

  /**
   * Display banner when in Exploration Mode
   */
  useEffect(() => {
    if (props.projectMode === "explore") {
      setExplorationMode(true);
    }
  }, [props.projectMode]);

  /**
   * Use keyboard shortcuts
   */
  useEffect(() => {
    if (props.keyPressEnabled && !recordNote.expand) {
      if (relevantPress && recordState.isloaded) {
        makeDecision(1);
      }
      if (irrelevantPress && recordState.isloaded) {
        makeDecision(0);
      }
      if (undoPress && undoState.open && props.undoEnabled) {
        undoDecision();
      }
      if (notePress && recordState.isloaded && recordNote.saved) {
        setRecordNote((s) => {
          return {
            ...s,
            expand: true,
            saved: false,
          };
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relevantPress, irrelevantPress, undoPress, notePress]);

  return (
    <Box className={classes.root} aria-label="review page">
      {/* Banner Exploration Mode */}
      <ExplorationModeBanner
        explorationMode={explorationMode}
        setExplorationMode={setExplorationMode}
      />

      {/* Article card */}
      <RecordCard
        record={recordState["record"]}
        recordNote={recordNote}
        setRecordNote={setRecordNote}
        isloaded={recordState["isloaded"]}
        fontSize={props.fontSize}
      />

      {/* Decision button */}
      <DecisionButton
        makeDecision={makeDecision}
        mobileScreen={props.mobileScreen}
        previousSelection={recordState["selection"]}
      />

      {/* Decision undo bar */}
      <DecisionUndoBar
        state={undoState}
        undo={undoDecision}
        close={closeUndoBar}
      />

      {/* Error Handler */}
      {error.message !== null && (
        <ErrorHandler error={error} setError={setError} />
      )}
    </Box>
  );
};

export default connect(mapStateToProps)(ReviewPage);
