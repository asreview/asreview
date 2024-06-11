import React from "react";
import {
  Alert,
  Box,
  Fab,
  Stack,
  Tooltip,
  TextField,
  Chip,
  CardActions,
  Button,
  Divider,
  CardContent,
  Typography,
  IconButton,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { styled } from "@mui/material/styles";
import { Favorite, FavoriteBorder, Expand, Opacity } from "@mui/icons-material";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import NotInterestedOutlinedIcon from "@mui/icons-material/NotInterestedOutlined";
import "./ReviewPage.css";
import { useKeyPress } from "hooks/useKeyPress";
import { useToggle } from "hooks/useToggle";
import { ProjectAPI } from "api";

import { TagsTable } from ".";

import ElasIcon from "icons/ElasIcon";

const PREFIX = "DecisionButton";

const classes = {
  icon: `${PREFIX}-icon`,
};

const Root = styled("div")(({}) => ({
  [`& .${classes.icon}`]: {
    opacity: 0.36,
  },
}));

const DecisionButton = ({
  project_id,
  record_id,
  label,
  labelFromDataset,
  tagsForm,
  tagValues = [],
  note,
  afterDecision,
  keyPressEnabled = false,
  disabled = false,
}) => {
  const [showNotes, toggleShowNotes] = useToggle(false);
  const [noteState, setNoteState] = React.useState(note);
  const [tagValuesState, setTagValuesState] = React.useState(tagValues);

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateClassification,
    {
      onSuccess: () => {
        afterDecision();
      },
    },
  );

  const makeDecision = (label) => {
    mutate({
      project_id: project_id,
      record_id: record_id,
      label: label,
      note: noteState,
      tagValues: tagValuesState,
    });
  };

  /**
   * Use keyboard shortcuts
   */

  const relevantPress = useKeyPress("r");
  const irrelevantPress = useKeyPress("i");
  // const undoPress = useKeyPress("u");
  const notePress = useKeyPress("n");

  const handleNote = (event) => {
    setNoteState(event.target.value);
  };

  React.useEffect(() => {
    if (keyPressEnabled) {
      if (relevantPress) {
        makeDecision(1);
      }
      if (irrelevantPress) {
        makeDecision(0);
      }
      if (notePress) {
        toggleShowNotes();
      }
    }
  }, [relevantPress, irrelevantPress, notePress]);

  const hasTags = Array.isArray(tagsForm) && tagsForm.length > 0;

  return (
    <Root>
      <Divider>{/* <ElasIcon className={classes.icon}/> */}</Divider>

      {hasTags && (
        <>
          <CardContent>
            <TagsTable
              tagsForm={tagsForm}
              tagValues={tagValuesState}
              setTagValues={setTagValuesState}
              disabled={disabled}
            />
          </CardContent>
        </>
      )}

      {(showNotes || (disabled && note !== null)) && (
        <>
          {/* <Divider /> */}
          <CardContent>
            <TextField
              autoComplete="off"
              id="record-note"
              label="Note"
              focused={true}
              fullWidth
              helperText={
                !disabled && "Note is saved when label decision is made."
              }
              multiline
              onChange={handleNote}
              placeholder="Write a note for this record..."
              rows={4}
              value={noteState}
              disabled={disabled}
            />
          </CardContent>
        </>
      )}

      {labelFromDataset && (
        <CardContent>
          <Alert severity="info">
            {labelFromDataset === -1 && "No label in dataset"}
            {labelFromDataset === 0 && "Label in dataset is irrelevant"}
            {labelFromDataset === 1 && "Label in dataset is relevant"}
          </Alert>
        </CardContent>
      )}

      <CardActions>
        {/*
        <Typography>
          Is this record relevant to your review question?
        </Typography> */}

        {!disabled && (
          <>
            <Button
              id="relevant"
              onClick={() => makeDecision(1)}
              // variant={label === 1 ? "outlined" : undefined}
              variant="contained"
              startIcon={<LibraryAddOutlinedIcon />}
            >
              Add
            </Button>
            <Button
              id="irrelevant"
              onClick={() => makeDecision(0)}
              // variant={label === 0 ? "outlined" : undefined}
              startIcon={<NotInterestedOutlinedIcon />}
            >
              Not interesting
            </Button>
          </>
        )}

        {disabled && (
          <>
            {/* {label === 1 && ( */}
            <Chip
              icon={<LibraryAddOutlinedIcon />}
              label="Added"
              color="primary"
            />
            {/* )} */}

            {/* {label === 0 && ( */}
            <Chip
              icon={<NotInterestedOutlinedIcon />}
              label="Not interested"
              color="primary"
            />
            {/* )} */}
          </>
        )}

        {!disabled && (
          <IconButton onClick={toggleShowNotes} aria-label="add note">
            <NoteAltOutlinedIcon />
          </IconButton>
        )}
      </CardActions>
    </Root>
  );
};

export default DecisionButton;
