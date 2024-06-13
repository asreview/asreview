import React from "react";
import {
  Alert,
  Box,
  Fab,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

import { useHotkeys } from "react-hotkeys-hook";

import { styled } from "@mui/material/styles";
import { Favorite, FavoriteBorder, Expand, Opacity } from "@mui/icons-material";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import NotInterestedOutlinedIcon from "@mui/icons-material/NotInterestedOutlined";
import "./ReviewPage.css";
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

const NoteDialog = ({ project_id, record_id, open, onClose, note }) => {
  const [noteState, setNoteState] = React.useState(note);

  const { isError, isLoading, mutate } = useMutation(ProjectAPI.mutateNote, {
    onSuccess: () => {
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Add note</DialogTitle>
      <DialogContent>
        <TextField
          autoComplete="off"
          id="record-note"
          autoFocus
          fullWidth
          multiline
          onChange={(event) => setNoteState(event.target.value)}
          placeholder="Write a note for this record..."
          rows={4}
          value={noteState}
          error={isError}
          disabled={isLoading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            mutate({
              project_id: project_id,
              record_id: record_id,
              note: noteState,
            });
          }}
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DecisionButton = ({
  project_id,
  record_id,
  label,
  labelFromDataset = null,
  tagsForm,
  tagValues = [],
  note = null,
  decisionCallback,
  retrainAfterDecision = true,
  disabled = false,
}) => {
  const [showNotes, toggleShowNotes] = useToggle(false);
  const [tagValuesState, setTagValuesState] = React.useState(tagValues);

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateClassification,
    {
      onSuccess: () => {
        decisionCallback();
      },
    },
  );

  const makeDecision = (label) => {
    mutate({
      project_id: project_id,
      record_id: record_id,
      label: label,
      tagValues: tagValuesState,
      retrain_model: retrainAfterDecision,
    });
  };

  useHotkeys("r", () => makeDecision(1));
  useHotkeys("i", () => makeDecision(0));
  useHotkeys("n", toggleShowNotes, { keyup: true });

  const hasTags = Array.isArray(tagsForm) && tagsForm.length > 0;

  return (
    <Root>
      {hasTags && (
        <>
          <Divider>Tags</Divider>
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

      {note !== null && (
        <>
          <Divider />
          <CardContent>{note}</CardContent>
        </>
      )}

      <Divider />

      {labelFromDataset !== null && (
        <CardContent>
          {labelFromDataset === -1 && (
            <Alert severity="info">No label in dataset</Alert>
          )}
          {labelFromDataset === 0 && (
            <Alert severity="info">Label in dataset is irrelevant</Alert>
          )}
          {labelFromDataset === 1 && (
            <Alert severity="info">Label in dataset is relevant</Alert>
          )}
        </CardContent>
      )}

      <CardActions sx={{ display: "block" }}>
        {/*
        <Typography>
          Is this record relevant to your review question?
        </Typography> */}

        {!disabled && (
          <>
            <Button
              id="relevant"
              onClick={() => makeDecision(1)}
              variant="contained"
              startIcon={<LibraryAddOutlinedIcon />}
            >
              Add
            </Button>
            <Button
              id="irrelevant"
              onClick={() => makeDecision(0)}
              startIcon={<NotInterestedOutlinedIcon />}
            >
              Not interesting
            </Button>
          </>
        )}

        {disabled && (
          <>
            {label === 1 && (
              <Chip
                icon={<LibraryAddOutlinedIcon />}
                label="Added"
                color="primary"
              />
            )}

            {label === 0 && (
              <Chip
                icon={<NotInterestedOutlinedIcon />}
                label="Not interested"
                color="primary"
              />
            )}
          </>
        )}

        {!disabled && (
          <>
            <Tooltip title="Add note">
              <IconButton
                onClick={toggleShowNotes}
                aria-label="add note"
                sx={{ float: "right" }}
              >
                <NoteAltOutlinedIcon />
              </IconButton>
            </Tooltip>
            <NoteDialog
              project_id={project_id}
              record_id={record_id}
              open={showNotes}
              onClose={toggleShowNotes}
              note={note}
            />
          </>
        )}
      </CardActions>
    </Root>
  );
};

export default DecisionButton;
