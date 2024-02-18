import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { Box, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";

import { ActionsFeedbackBar } from "../../Components";
import {
  DecisionButton,
  DecisionUndoBar,
  ExplorationModeBanner,
  RecordCard,
  TagsTable,
} from "../ReviewComponents";

import { ReviewPageFinished } from "../../ProjectComponents/ReviewComponents";

import { ProjectAPI } from "../../api";
import { useKeyPress } from "../../hooks/useKeyPress";

import "./ReviewPage.css";
import FinishSetup from "./ReviewPageTraining";

const Root = styled("div")(({ theme }) => ({
  height: "100%",
}));

const ReviewPageRecord = (props) => {
  const { project_id } = useParams();
  const queryClient = useQueryClient();

  const [explorationMode, setExplorationMode] = React.useState(false);
  const [activeRecord, setActiveRecord] = React.useState(
    props.record["result"],
  );
  const [previousRecord, setPreviousRecord] = React.useState({
    record: null,
    label: null,
    note: null,
    tagValues: null,
    show: false,
  });
  const [recordNote, setRecordNote] = React.useState({
    expand: false,
    shrink: true, // for smooth transition
    data: "",
  });
  const [tagValues, setTagValues] = React.useState({});
  const [undoState, setUndoState] = React.useState({
    open: false,
    message: null,
  });

  const relevantPress = useKeyPress("r");
  const irrelevantPress = useKeyPress("i");
  const undoPress = useKeyPress("u");
  const notePress = useKeyPress("n");

  const tagValuesEqual = (tagValues1, tagValues2) => {
    if (tagValues1 === null || tagValues2 === null) {
      return tagValues1 === null && tagValues2 === null;
    }

    const keys1 = Object.keys(tagValues1);
    const keys2 = Object.keys(tagValues2);
    const union = new Set(keys1.concat(keys2));
    return union.size === keys1.length && union.size === keys2.length;
  };

  useQuery(["fetchRecord", { project_id }], ProjectAPI.fetchRecord, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setActiveRecord(data["result"]);
    },
  });

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateClassification,
    {
      onMutate: (variables) => {
        closeUndoBar(); // hide potentially active undo bar
        setPreviousRecord({
          record: activeRecord,
          label: variables.label,
          note: variables.note,
          tagValues: variables.tagValues,
          show: false,
        });
      },
      onSuccess: (data, variables) => {
        setActiveRecord(null);
        resetNote();
        resetTagValues();
        queryClient.invalidateQueries("fetchRecord");
        showUndoBarIfNeeded(variables.label, variables.initial);
      },
    },
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
    setTagValues(previousRecord.tagValues);
  };

  const resetPreviousRecord = () => {
    setPreviousRecord({
      record: null,
      label: null,
      note: null,
      tagValues: null,
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
      const message = initial ? `Label saved as ${mark}` : "Changes saved";
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
  const disableButton = () => {
    return !activeRecord || isLoading;
  };

  const needsClassification = (label) => {
    if (!previousRecord.show) {
      return true;
    }
    return (
      label !== previousRecord.label ||
      recordNote.data !== previousRecord.note ||
      !tagValuesEqual(tagValues, previousRecord.tagValues)
    );
  };

  // const skipClassification = () => {
  //   setActiveRecord(recordQuery.data["result"]);
  //   resetPreviousRecord();
  //   resetNote();
  //   resetTagValues();
  // };

  const makeDecision = (label) => {
    if (!needsClassification(label)) {
      // skipClassification();
    } else {
      mutate({
        project_id: project_id,
        record_id: activeRecord.record_id,
        label: label,
        note: recordNote.data,
        tagValues: tagValues,
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
      data: "",
    });
  };

  const resetTagValues = () => {
    setTagValues({});
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
        <Box className="review-page-body-wrapper">
          <Box className="review-page-body">
            {/* Banner Exploration Mode */}
            <ExplorationModeBanner
              explorationMode={explorationMode}
              setExplorationMode={setExplorationMode}
            />
            {/* Article card */}
            <RecordCard
              disableButton={disableButton}
              error={error}
              isError={isError}
              activeRecord={activeRecord}
              recordNote={recordNote}
              setRecordNote={setRecordNote}
              fontSize={props.fontSize}
              mobileScreen={props.mobileScreen}
              noteFieldAutoFocus={noteFieldAutoFocus}
              previousRecord={previousRecord}
            />
          </Box>
          {/* Decision button */}
          <DecisionButton
            disableButton={disableButton}
            makeDecision={makeDecision}
            mobileScreen={props.mobileScreen}
            previousRecord={previousRecord}
          />
          {/* Labels table */}
          {Array.isArray(props.tags) && props.tags.length > 0 && (
            <TagsTable
              tags={props.tags}
              tagValues={tagValues}
              setTagValues={setTagValues}
            />
          )}
        </Box>
      </Fade>
      {/* Decision undo bar */}
      <DecisionUndoBar
        disableButton={disableButton}
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

const ReviewPage = ({
  project_id,
  mobileScreen,
  projectMode,
  fontSize,
  undoEnabled,
  keyPressEnabled,
  tags,
}) => {
  const [record, setRecord] = React.useState(null);

  /* fetch the record and check if the project is training */
  const { refetch } = useQuery(
    ["fetchRecord", { project_id }],
    ProjectAPI.fetchRecord,
    {
      refetchOnWindowFocus: false,
      retry: false,
      refetchInterval: 4000,
      refetchIntervalInBackground: true,
      // enabled only during the training phase
      enabled:
        record === null ||
        (record?.result === null &&
          !record?.has_ranking &&
          !record?.pool_empty),
      onSuccess: (data) => {
        setRecord(data);
      },
    },
  );

  return (
    <Root aria-label="review page">
      {record?.result === null &&
        !record?.has_ranking &&
        !record?.pool_empty && (
          <FinishSetup project_id={project_id} refetch={refetch} />
        )}

      {record?.result !== null &&
        record?.has_ranking &&
        !record?.pool_empty && (
          <ReviewPageRecord
            record={record}
            projectMode={projectMode}
            mobileScreen={mobileScreen}
            fontSize={fontSize}
            undoEnabled={undoEnabled}
            keyPressEnabled={keyPressEnabled}
            tags={tags}
          />
        )}

      {/* Review finished */}
      {record?.result === null &&
        !record?.has_ranking &&
        record?.pool_empty && (
          <ReviewPageFinished mobileScreen={mobileScreen} />
        )}
    </Root>
  );
};

export default ReviewPage;
