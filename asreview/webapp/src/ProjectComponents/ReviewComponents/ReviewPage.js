import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import { Box, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";

import { ActionsFeedbackBar, PageHeader } from "../../Components";
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
  height: "100%",
}));

const ReviewPage = (props) => {
  const queryClient = useQueryClient();
  const [explorationMode, setExplorationMode] = React.useState(false);
  const [activeRecord, setActiveRecord] = React.useState(null);
  const [previousRecord, setPreviousRecord] = React.useState({
    record: null,
    label: null,
    note: null,
    show: false,
  });
  const [recordNote, setRecordNote] = React.useState({
    expand: false,
    shrink: true, // for smooth transition
    data: null,
  });
  const [undoState, setUndoState] = React.useState({
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

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateClassification,
    {
      onMutate: (variables) => {
        closeUndoBar(); // hide potentially active undo bar
        setPreviousRecord({
          record: activeRecord,
          label: variables.label,
          note: variables.note,
          show: false,
        });
      },
      onSuccess: (data, variables) => {
        setActiveRecord(null);
        resetNote();
        queryClient.invalidateQueries("fetchRecord");
        showUndoBarIfNeeded(variables.label, variables.initial);
      },
    }
  );

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
    setRecordNote((s) => {
      return {
        ...s,
        data: previousRecord.note,
      };
    });
  };

  const resetPreviousRecord = () => {
    setPreviousRecord({
      record: null,
      label: null,
      note: null,
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
      const mark = label === 0 ? "irrelevant" : "relevant";
      const message = initial ? `Labeled as ${mark}` : "Changes saved";
      showUndoBar(message);
    }
  };

  const closeUndoBar = () => {
    setUndoState({
      open: false,
      message: null,
    });
  };

  const undoDecision = () => {
    closeUndoBar();
    loadPreviousRecord();
  };

  /**
   * Decision button config
   */
  const disableDecisionButton = () => {
    return !activeRecord || isLoading;
  };

  const needsClassification = (label) => {
    if (!previousRecord.show) {
      return true;
    }
    return (
      label !== previousRecord.label || recordNote.data !== previousRecord.note
    );
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
        label: label,
        note: recordNote.data,
        initial: !previousRecord.show,
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
  React.useEffect(() => {
    if (props.projectMode === "explore") {
      setExplorationMode(true);
    }
  }, [props.projectMode]);

  /**
   * Use keyboard shortcuts
   */
  React.useEffect(() => {
    if (props.keyPressEnabled && !recordNote.expand) {
      if (relevantPress && activeRecord) {
        makeDecision(1);
      }
      if (irrelevantPress && activeRecord) {
        makeDecision(0);
      }
      if (undoPress && activeRecord && undoState.open && props.undoEnabled) {
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
      <Fade in>
        <Box>
          <PageHeader
            header="Project review"
            mobileScreen={props.mobileScreen}
          />
        </Box>
      </Fade>
      <Fade in>
        <Box className="review-page-body-wrapper">
          <Box className="review-page-body">
            {/* Banner Exploration Mode */}
            <ExplorationModeBanner
              explorationMode={explorationMode}
              setExplorationMode={setExplorationMode}
            />
            {/* Article card */}
            <RecordCard
              error={recordQuery.error}
              isError={recordQuery.isError}
              activeRecord={activeRecord}
              recordNote={recordNote}
              setRecordNote={setRecordNote}
              fontSize={props.fontSize}
              noteFieldAutoFocus={noteFieldAutoFocus}
              previousRecord={previousRecord}
            />
          </Box>
          {/* Decision button */}
          <DecisionButton
            disableDecisionButton={disableDecisionButton}
            makeDecision={makeDecision}
            mobileScreen={props.mobileScreen}
            previousRecord={previousRecord}
          />
        </Box>
      </Fade>
      {/* Decision undo bar */}
      <DecisionUndoBar
        disableDecisionButton={disableDecisionButton}
        state={undoState}
        undo={undoDecision}
        close={closeUndoBar}
      />
      {/* Error handler */}
      {isError && (
        <ActionsFeedbackBar
          feedback={error?.message + " Please try again."}
          open={isError}
          onClose={reset}
        />
      )}
    </Root>
  );
};

export default connect(mapStateToProps)(ReviewPage);
