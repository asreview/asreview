import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import { styled } from "@mui/material/styles";

import {
  DecisionButton,
  DecisionUndoBar,
  ExplorationModeBanner,
  RecordCard,
} from "../ReviewComponents";

import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";
import { useKeyPress } from "../../hooks/useKeyPress";

import "./ReviewPage.css";

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
}));

const ReviewPage = (props) => {
  const queryClient = useQueryClient();
  const [explorationMode, setExplorationMode] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);
  const [previousRecord, setPreviousRecord] = useState({
    record: null,
    label: null,
    show: false,
  });
  const [recordNote, setRecordNote] = useState({
    expand: false,
    shrink: true, // for smooth transition
    data: null,
  });
  const [undoState, setUndoState] = useState({
    open: false,
    message: null,
  });

  const relevantPress = useKeyPress("r");
  const irrelevantPress = useKeyPress("i");
  const undoPress = useKeyPress("u");
  const notePress = useKeyPress("n");

  const recordQuery = useQuery(
    ["fetchRecord", { project_id: props.project_id }],
    ProjectAPI.fetchRecord,
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data["pool_empty"]) {
          props.handleAppState("review-complete");
        } else {
          setActiveRecord(data["result"]);
        }
      },
    }
  );

  const { mutate } = useMutation(ProjectAPI.mutateClassification, {
    onMutate: (variables) => {
      setPreviousRecord({
        record: activeRecord,
        label: variables.initial
          ? variables.label
          : variables.label === 1
          ? 0
          : 1,
        show: false,
      });
      resetNote();
      setActiveRecord(null);
      closeUndoBar(); // hide potentially active undo bar
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries("fetchRecord");
      showUndoBarIfNeeded(variables.label, variables.initial);
    },
  });

  /**
   * Previous record config
   */
  const loadPreviousRecord = () => {
    setPreviousRecord((s) => {
      return {
        ...s,
        show: true,
      };
    });
    setActiveRecord(previousRecord.record);
  };

  const resetPreviousRecord = () => {
    setPreviousRecord({
      record: null,
      label: null,
      show: false,
    });
  };

  /**
   * Undo bar config
   */
  const showUndoBar = (message) => {
    setUndoState({
      open: true,
      message: message,
    });
  };

  const showUndoBarIfNeeded = (label, initial) => {
    if (props.undoEnabled) {
      const mark =
        label === 0
          ? initial
            ? "irrelevant"
            : "relevant"
          : initial
          ? "relevant"
          : "irrelevant";
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

  const isUndoModeActive = () => {
    return activeRecord.doc_id === previousRecord["record"]?.doc_id;
  };

  const undoDecision = () => {
    closeUndoBar();
    loadPreviousRecord();
  };

  /**
   * Decision button config
   */
  const needsClassification = (label) => {
    if (!isUndoModeActive()) {
      return true;
    }
    return label !== previousRecord.label;
  };

  const skipClassification = () => {
    setActiveRecord(recordQuery.data["result"]);
    resetPreviousRecord();
    resetNote();
  };

  const makeDecision = (label) => {
    if (!needsClassification(label)) {
      skipClassification();
    } else {
      mutate({
        project_id: props.project_id,
        doc_id: activeRecord.doc_id,
        label: !isUndoModeActive() ? label : previousRecord.label,
        initial: !isUndoModeActive(),
      });
    }
  };

  /**
   * Note field config
   */
  const resetNote = () => {
    setRecordNote({
      expand: false,
      shrink: true,
      data: null,
    });
  };

  const noteFieldAutoFocus = () => {
    return !notePress;
  };

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
      if (relevantPress && activeRecord) {
        makeDecision(1);
      }
      if (irrelevantPress && activeRecord) {
        makeDecision(0);
      }
      if (undoPress && undoState.open && props.undoEnabled) {
        undoDecision();
      }
      if (notePress && activeRecord) {
        setRecordNote((s) => {
          return {
            ...s,
            expand: true,
            shrink: false,
          };
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relevantPress, irrelevantPress, undoPress, notePress]);

  return (
    <Root aria-label="review page">
      {/* Banner Exploration Mode */}
      <ExplorationModeBanner
        explorationMode={explorationMode}
        setExplorationMode={setExplorationMode}
      />

      {/* Article card */}
      <RecordCard
        activeRecord={activeRecord}
        recordNote={recordNote}
        setRecordNote={setRecordNote}
        fontSize={props.fontSize}
        noteFieldAutoFocus={noteFieldAutoFocus}
      />

      {/* Decision button */}
      <DecisionButton
        makeDecision={makeDecision}
        mobileScreen={props.mobileScreen}
        previousRecord={previousRecord}
      />

      {/* Decision undo bar */}
      <DecisionUndoBar
        state={undoState}
        undo={undoDecision}
        close={closeUndoBar}
      />
    </Root>
  );
};

export default connect(mapStateToProps)(ReviewPage);
