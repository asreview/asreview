import {
  Alert,
  Box,
  Button,
  CardActions,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Grid2 as Grid,
  IconButton,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ListItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { QueryClient, useMutation, useQueryClient } from "react-query";

import { useHotkeys } from "react-hotkeys-hook";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import NotInterestedOutlinedIcon from "@mui/icons-material/NotInterestedOutlined";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import DoneAllOutlined from "@mui/icons-material/DoneAllOutlined";
import MoreVert from "@mui/icons-material/MoreVert";
import { ProjectAPI } from "api";
import { useToggle } from "hooks/useToggle";
import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en";
import { DeleteOutline } from "@mui/icons-material";

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");

// const PREFIX = "RecordCardLabeler";

// const classes = {
//   icon: `${PREFIX}-icon`,
// };

// const Root = styled("div")(() => ({
//   [`& .${classes.icon}`]: {
//     opacity: 0.36,
//   },
// }));

const NoteDialog = ({ project_id, record_id, open, onClose, note = null }) => {
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
          value={noteState ? noteState : ""}
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

const RecordCardLabeler = ({
  project_id,
  record_id,
  label,
  labelFromDataset = null,
  tagsForm,
  tagValues = null,
  note = null,
  showNotes = true,
  labelDatetime = null,
  user = null,
  decisionCallback,
  hotkeys = false,
  landscape = false,
  retrainAfterDecision = true,
}) => {
  const queryClient = useQueryClient();

  const [editState, toggleEditState] = useToggle(!(label === 1 || label === 0));
  const [showNotesDialog, toggleShowNotesDialog] = useToggle(false);
  const [tagValuesState, setTagValuesState] = React.useState(
    tagValues ? tagValues : structuredClone(tagsForm),
  );

  const { error, isError, isLoading, mutate, isSuccess } = useMutation(
    ProjectAPI.mutateClassification,
    {
      onSuccess: () => {
        // invalidate queries
        queryClient.invalidateQueries("fetchLabeledRecord", project_id);

        decisionCallback();
      },
    },
  );

  const handleTagValueChange = (isChecked, groupId, tagId) => {
    let groupI = tagValuesState.findIndex((group) => group.id === groupId);
    let tagI = tagValuesState[groupI].values.findIndex(
      (tag) => tag.id === tagId,
    );

    let tagValuesCopy = structuredClone(tagValuesState);
    tagValuesCopy[groupI].values[tagI]["checked"] = isChecked;

    setTagValuesState(tagValuesCopy);
  };

  const makeDecision = (label) => {
    mutate({
      project_id: project_id,
      record_id: record_id,
      label: label,
      tagValues: tagValuesState,
      retrain_model: retrainAfterDecision,
    });
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useHotkeys("r", () => hotkeys && makeDecision(1));
  useHotkeys("i", () => hotkeys && makeDecision(0));
  useHotkeys("n", () => hotkeys && toggleShowNotesDialog(), { keyup: true });

  return (
    <Stack
      sx={(theme) => ({
        backgroundColor: theme.palette.primary.light,
        justifyContent: "space-between",
        alignItems: "stretch",
        height: "100%",
      })}
    >
      <Box>
        {Array.isArray(tagsForm) && tagsForm.length > 0 && (
          <CardContent>
            <Grid container spacing={2} columns={2}>
              {tagsForm &&
                tagsForm.map((group, i) => (
                  <Grid size={landscape ? 2 : { xs: 2, sm: 1 }} key={group.id}>
                    <Stack direction="column" spacing={1}>
                      <Typography variant="h6">{group.name}</Typography>
                      <FormGroup row={false}>
                        {group.values.map((tag, j) => (
                          <FormControlLabel
                            key={`${group.id}:${tag.id}`}
                            control={
                              <Checkbox
                                checked={
                                  tagValuesState[i]?.values[j]?.checked || false
                                }
                                onChange={(e) => {
                                  handleTagValueChange(
                                    e.target.checked,
                                    group.id,
                                    tag.id,
                                  );
                                }}
                                disabled={!editState || isLoading || isSuccess}
                              />
                            }
                            label={tag.name}
                          />
                        ))}
                      </FormGroup>
                    </Stack>
                  </Grid>
                ))}
            </Grid>
          </CardContent>
        )}

        {note !== null && <CardContent>{note}</CardContent>}
      </Box>

      <Box>
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

        {isError && (
          <CardContent>
            <Alert severity="error">
              Failed to label record. {error?.message}
            </Alert>
          </CardContent>
        )}
        <CardActions
          sx={(theme) => ({
            backgroundColor: theme.palette.primary.dark,
            display: "block",
            color: theme.palette.getContrastText(theme.palette.primary.dark),
          })}
        >
          {editState && (
            <>
              <Button
                id="relevant"
                onClick={() => makeDecision(1)}
                variant="contained"
                startIcon={<LibraryAddOutlinedIcon />}
                disabled={isLoading || isSuccess}
              >
                Add
              </Button>
              <Button
                id="irrelevant"
                onClick={() => makeDecision(0)}
                startIcon={<NotInterestedOutlinedIcon />}
                disabled={isLoading || isSuccess}
                sx={(theme) => ({
                  color: theme.palette.getContrastText(
                    theme.palette.primary.dark,
                  ),
                })}
              >
                Not relevant
              </Button>
            </>
          )}

          {editState && showNotes && (
            <>
              <Tooltip title="Add note">
                <IconButton
                  onClick={toggleShowNotesDialog}
                  aria-label="add note"
                  disabled={isLoading || isSuccess}
                  sx={(theme) => ({
                    float: "right",
                    color: theme.palette.getContrastText(
                      theme.palette.primary.dark,
                    ),
                  })}
                >
                  <NoteAltOutlinedIcon />
                </IconButton>
              </Tooltip>
              <NoteDialog
                project_id={project_id}
                record_id={record_id}
                open={showNotesDialog}
                onClose={toggleShowNotesDialog}
                note={note}
              />
            </>
          )}

          {(label === 1 || label === 0) && (
            <>
              <Typography
                variant="secondary"
                // sx={{ pr: "0.5rem", opacity: 0.7 }}
              >
                Added to
              </Typography>
              {label === 1 && <Chip label="My collection" color="primary" />}

              {label === 0 && <Chip label="Not relevant" color="primary" />}

              <Typography
                variant="secondary"
                // sx={{ pl: "0.2rem", opacity: 0.7 }}
              >
                {timeAgo.format(new Date(labelDatetime))} {user && "by " + user}
              </Typography>
            </>
          )}

          {(label === 1 || label === 0) && (
            <>
              <Tooltip title="Options">
                <IconButton
                  id="card-positioned-button"
                  aria-controls={openMenu ? "card-positioned-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={openMenu ? "true" : undefined}
                  onClick={handleClick}
                  sx={(theme) => ({
                    float: "right",
                    color: theme.palette.getContrastText(
                      theme.palette.primary.dark,
                    ),
                  })}
                >
                  <MoreVert />
                </IconButton>
              </Tooltip>

              <Menu
                id="card-positioned-menu"
                aria-labelledby="card-positioned-button"
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
              >
                {/* toggle label */}
                {(label === 1 || label === 0) && (
                  <MenuItem onClick={() => makeDecision(label === 1 ? 0 : 1)}>
                    <ListItemIcon>
                      {label === 1 ? (
                        <NotInterestedOutlinedIcon />
                      ) : (
                        <LibraryAddOutlinedIcon />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        label === 1
                          ? "Change to irrelevant"
                          : "Add to collection"
                      }
                    />
                  </MenuItem>
                )}
                <MenuItem onClick={() => {}} disabled>
                  <ListItemIcon>
                    <DeleteOutline />
                  </ListItemIcon>
                  <ListItemText
                    primary={"Remove my label"}
                    secondary={"Coming soon"}
                  />
                </MenuItem>
              </Menu>
            </>
          )}
        </CardActions>
      </Box>
    </Stack>
  );
};

export default RecordCardLabeler;
