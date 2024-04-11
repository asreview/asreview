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
import { Edit, Favorite, FavoriteBorder, Expand } from "@mui/icons-material";
import "./ReviewPage.css";
import { useKeyPress } from "hooks/useKeyPress";
import { useToggle } from "hooks/useToggle";
import { ProjectAPI } from "api";

import { TagsTable } from ".";

const PREFIX = "DecisionButton";

const classes = {
  extendedFab: `${PREFIX}-extendedFab`,
};

const Root = styled("div")(({ theme }) => ({
  // [`& .${classes.extendedFab}`]: {
  //   marginRight: theme.spacing(1),
  // },
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

  let relevantLabel = "Yes";
  let irrelevantLabel = "No";

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateClassification,
    {
      onSuccess: () => {
        afterDecision();
      },
    },
  );

  console.log(tagValuesState);

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
      <Divider>
        <Chip label="Labels & decisions" size="small" />
      </Divider>

      {!(disabled && !hasTags) && (
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

      <CardContent>
        <Alert severity="info" sx={{ margin: "0.5rem 1rem" }}>
          {labelFromDataset === -1 && "No label in dataset"}
          {labelFromDataset === 0 && "Label in dataset is irrelevant"}
          {labelFromDataset === 1 && "Label in dataset is relevant"}
        </Alert>
      </CardContent>
      <CardActions>
        {!disabled && (
          <IconButton onClick={toggleShowNotes} aria-label="add note">
            <Edit />
          </IconButton>
        )}

        <Typography>
          Is this record relevant to your review question?
        </Typography>

        <Button
          id="relevant"
          onClick={() => makeDecision(1)}
          variant={label === 1 ? "outlined" : undefined}
          disabled={disabled}
        >
          <Favorite className={classes.extendedFab} />
          {relevantLabel}
        </Button>
        <Button
          id="irrelevant"
          onClick={() => makeDecision(0)}
          variant={label === 0 ? "outlined" : undefined}
          disabled={disabled}
        >
          <FavoriteBorder className={classes.extendedFab} />
          {irrelevantLabel}
        </Button>
      </CardActions>
    </Root>
  );
};

export default DecisionButton;
