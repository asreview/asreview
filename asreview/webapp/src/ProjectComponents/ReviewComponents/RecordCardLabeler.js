import {
  Alert,
  AlertTitle,
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
  Divider,
  FormControlLabel,
  FormGroup,
  Grid2 as Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import React from "react";
import { useMutation, useQueryClient } from "react-query";

import { useHotkeys } from "react-hotkeys-hook";

import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import MoreVert from "@mui/icons-material/MoreVert";
import NotInterestedOutlinedIcon from "@mui/icons-material/NotInterestedOutlined";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import { ProjectAPI } from "api";
import { useToggle } from "hooks/useToggle";
import TimeAgo from "javascript-time-ago";

import { DeleteOutline, LabelOutlined } from "@mui/icons-material";
import en from "javascript-time-ago/locale/en";

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");

const formatUser = (user) => {
  if (user?.current_user) {
    return "by you";
  }
  return `by ${user.name}`;
};

const NoteDialog = ({ project_id, record_id, open, onClose, note = null }) => {
  const queryClient = useQueryClient();

  const [noteState, setNoteState] = React.useState(note);

  const { isError, isLoading, mutate } = useMutation(ProjectAPI.mutateNote, {
    onSuccess: () => {
      queryClient.setQueryData(["fetchRecord", { project_id }], (data) => {
        return {
          ...data,
          result: {
            ...data.result,
            state: {
              ...data.result.state,
              note: noteState,
            },
          },
        };
      });
      onClose();
    },
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      disableRestoreFocus // bug https://github.com/mui/material-ui/issues/33004
    >
      <DialogTitle>Add note</DialogTitle>
      <DialogContent>
        <TextField
          autoComplete="off"
          id="record-note"
          autoFocus
          fullWidth
          multiline
          onChange={(event) => setNoteState(event.target.value)}
          onFocus={(e) =>
            e.currentTarget.setSelectionRange(
              e.currentTarget.value.length,
              e.currentTarget.value.length,
            )
          } // bug https://github.com/mui/material-ui/issues/12779
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
  labelTime = null,
  user = null,
  decisionCallback,
  hotkeys = false,
  landscape = false,
  retrainAfterDecision = true,
  changeDecision = true,
}) => {
  const queryClient = useQueryClient();

  const [editState] = useToggle(!(label === 1 || label === 0));
  const [showNotesDialog, toggleShowNotesDialog] = useToggle(false);
  const [tagValuesState, setTagValuesState] = React.useState(
    tagValues ? tagValues : structuredClone(tagsForm),
  );

  const { error, isError, isLoading, mutate, isSuccess } = useMutation(
    ProjectAPI.mutateClassification,
    {
      onSuccess: () => {
        // invalidate queries
        queryClient.invalidateQueries({
          queryKey: ["fetchRecord", { project_id }],
        });

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

  useHotkeys("v", () => hotkeys && !isLoading && !isSuccess && makeDecision(1));
  useHotkeys("x", () => hotkeys && !isLoading && !isSuccess && makeDecision(0));
  useHotkeys(
    "n",
    () => hotkeys && !isLoading && !isSuccess && toggleShowNotesDialog(),
    { keyup: true },
  );

  return (
    <Stack
      sx={(theme) => ({
        bgcolor: alpha(
          theme.palette.secondary.light,
          theme.palette.action.selectedOpacity * 2,
        ),
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
                                disabled={
                                  !editState ||
                                  !changeDecision ||
                                  isLoading ||
                                  isSuccess
                                }
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
      </Box>
      <Box>
        {(note !== null || labelFromDataset !== null) && (
          <>
            <Divider />
            <CardContent>
              {note && (
                <Alert
                  severity="info"
                  color="primary"
                  icon={<NoteAltOutlinedIcon />}
                  sx={{
                    mb: 2,
                  }}
                >
                  <AlertTitle>Note</AlertTitle>
                  {note}
                </Alert>
              )}
              {labelFromDataset === 0 && (
                <Alert severity="info" color="primary" icon={<LabelOutlined />}>
                  <AlertTitle>Not relevant</AlertTitle>
                  Label in dataset is not relevant
                </Alert>
              )}
              {labelFromDataset === 1 && (
                <Alert severity="info" color="primary" icon={<LabelOutlined />}>
                  <AlertTitle>Relevant</AlertTitle>
                  Label in dataset is relevant
                </Alert>
              )}
            </CardContent>
          </>
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
            bgcolor: theme.palette.secondary.dark,
            display: "block",
            color: theme.palette.getContrastText(theme.palette.secondary.dark),
          })}
        >
          {editState && (
            <>
              <Tooltip
                title="Add to my collection (V)"
                enterDelay={800}
                leaveDelay={200}
              >
                <Button
                  id="relevant"
                  onClick={() => makeDecision(1)}
                  variant="contained"
                  startIcon={<LibraryAddOutlinedIcon />}
                  disabled={isLoading || isSuccess}
                  sx={(theme) => ({
                    color: theme.palette.getContrastText(
                      theme.palette.tertiary.main,
                    ),
                    bgcolor: theme.palette.tertiary.main,
                  })}
                >
                  Add
                </Button>
              </Tooltip>
              <Tooltip
                title="Mark as not relevant and don't show again (X)"
                enterDelay={800}
                leaveDelay={200}
              >
                <Button
                  id="irrelevant"
                  onClick={() => makeDecision(0)}
                  startIcon={<NotInterestedOutlinedIcon />}
                  disabled={isLoading || isSuccess}
                  sx={(theme) => ({
                    color: theme.palette.getContrastText(
                      theme.palette.secondary.dark,
                    ),
                  })}
                >
                  Not relevant
                </Button>
              </Tooltip>
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
                      theme.palette.secondary.dark,
                    ),
                  })}
                >
                  <NoteAltOutlinedIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          <NoteDialog
            project_id={project_id}
            record_id={record_id}
            open={showNotesDialog}
            onClose={toggleShowNotesDialog}
            note={note}
          />
          {(label === 1 || label === 0) && (
            <>
              {!landscape && (
                <Typography variant="secondary" sx={{ pl: 1 }}>
                  Added to
                </Typography>
              )}
              {label === 1 && (
                <Chip
                  label="My collection"
                  color="primary"
                  sx={(theme) => ({
                    color: theme.palette.getContrastText(
                      theme.palette.tertiary.main,
                    ),
                    bgcolor: theme.palette.tertiary.main,
                  })}
                />
              )}
              {label === 0 && <Chip label="Not relevant" color="primary" />}
              <Typography variant="secondary">
                {timeAgo.format(new Date(labelTime * 1000))}{" "}
                {user && formatUser(user)}
              </Typography>
            </>
          )}

          {(label === 1 || label === 0) && changeDecision && (
            <>
              <Tooltip title="Options">
                <IconButton
                  id="card-positioned-button"
                  aria-controls={openMenu ? "card-positioned-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={openMenu ? "true" : undefined}
                  onClick={(event) => setAnchorEl(event.currentTarget)}
                  sx={(theme) => ({
                    float: "right",
                    color: theme.palette.getContrastText(
                      theme.palette.secondary.dark,
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
                onClose={() => setAnchorEl(null)}
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
                <MenuItem
                  onClick={() => {
                    toggleShowNotesDialog();
                    setAnchorEl(null);
                  }}
                >
                  <ListItemIcon>
                    <NoteAltOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary={note ? "Change note" : "Add note"} />
                </MenuItem>
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
