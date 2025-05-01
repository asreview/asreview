import {
  Box,
  Button,
  CardActions,
  CardContent,
  Checkbox,
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
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Alert,
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
      queryClient.invalidateQueries(["fetchLabeledRecord", { project_id }]);
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
          disabled={isLoading || noteState === note}
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
  onDecisionClose = null,
  hotkeys = false,
  landscape = false,
  retrainAfterDecision = true,
  changeDecision = true,
}) => {
  const [editState] = useToggle(!(label === 1 || label === 0));
  const [showNotesDialog, toggleShowNotesDialog] = useToggle(false);
  const [tagValuesState, setTagValuesState] = React.useState(
    tagValues ? tagValues : structuredClone(tagsForm),
  );

  const { error, isError, isLoading, mutate, isSuccess } = useMutation(
    ProjectAPI.mutateClassification,
    {
      onSuccess: () => {
        if (onDecisionClose) {
          onDecisionClose();
        }
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

  useHotkeys("r", () => hotkeys && !isLoading && !isSuccess && makeDecision(1));
  useHotkeys("i", () => hotkeys && !isLoading && !isSuccess && makeDecision(0));
  useHotkeys(
    "n",
    () => hotkeys && !isLoading && !isSuccess && toggleShowNotesDialog(),
    { keyup: true },
  );

  return (
    <Stack
      sx={(theme) => ({
        bgcolor: alpha(
          label === 1
            ? alpha(theme.palette.tertiary.main, 1)
            : label === 0
              ? alpha(theme.palette.grey[600], 1)
              : alpha(theme.palette.secondary.dark, 1),

          theme.palette.action.selectedOpacity * 1.5,
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
                  <Grid
                    size={
                      tagsForm.length === 1
                        ? 2
                        : landscape
                          ? 2
                          : { xs: 2, sm: 1 }
                    }
                    key={group.id}
                  >
                    <Stack direction="column" spacing={1}>
                      <Typography variant="h6">{group.label}</Typography>
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
                            label={tag.label}
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
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: "background.default",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <NoteAltOutlinedIcon />
                    <Typography variant="subtitle1">Note</Typography>
                  </Stack>
                  <Typography sx={{ mt: 1 }}>{note}</Typography>
                </Paper>
              )}
              {labelFromDataset === 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: "background.default",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LabelOutlined />
                    <Typography variant="subtitle1">Not relevant</Typography>
                  </Stack>
                  <Typography sx={{ mt: 1 }}>
                    This record is labeled as not relevant in the dataset
                  </Typography>
                </Paper>
              )}
              {labelFromDataset === 1 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: "background.default",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LabelOutlined />
                    <Typography variant="subtitle1">Relevant</Typography>
                  </Stack>
                  <Typography sx={{ mt: 1 }}>
                    This record is labeled as relevant in the dataset
                  </Typography>
                </Paper>
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
            bgcolor:
              label === 1
                ? alpha(theme.palette.tertiary.main, 1)
                : label === 0
                  ? alpha(theme.palette.grey[600], 1)
                  : null,
          })}
        >
          {editState && (
            <>
              <Tooltip
                title="Label as relevant (keyboard shortcut: R)"
                enterDelay={2000}
                leaveDelay={200}
                placement="bottom"
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
                  Relevant
                </Button>
              </Tooltip>
              <Tooltip
                title="Label as irrelevant (keyboard shortcut: I)"
                enterDelay={2000}
                leaveDelay={200}
                placement="bottom"
              >
                <Button
                  id="irrelevant"
                  onClick={() => makeDecision(0)}
                  startIcon={<NotInterestedOutlinedIcon />}
                  disabled={isLoading || isSuccess}
                  variant="contained"
                  color="grey.600"
                >
                  Not relevant
                </Button>
              </Tooltip>
            </>
          )}
          {(label === 1 || label === 0) && (
            <>
              {!landscape && (
                <Typography
                  variant="secondary"
                  sx={(theme) => ({
                    pl: 1,
                    color:
                      label === 1
                        ? theme.palette.getContrastText(
                            theme.palette.tertiary.main,
                          )
                        : label === 0
                          ? theme.palette.getContrastText(
                              theme.palette.grey[600],
                            )
                          : theme.palette.text.primary,
                  })}
                >
                  Labeled {label === 1 ? "relevant" : "not relevant"}{" "}
                  {user && formatUser(user)}{" "}
                  {timeAgo.format(new Date(labelTime * 1000))}
                </Typography>
              )}
            </>
          )}
          <Box sx={{ flexGrow: 1 }} />

          {editState && showNotes && (
            <>
              <Tooltip
                title="Add note (keyboard shortcut: N)"
                enterDelay={2000}
                leaveDelay={200}
                placement="bottom"
              >
                <IconButton
                  onClick={toggleShowNotesDialog}
                  aria-label="add note"
                  disabled={isLoading || isSuccess}
                  sx={(theme) => ({
                    // color: theme.palette.getContrastText(
                    //   theme.palette.secondary.dark,
                    // ),
                  })}
                >
                  <NoteAltOutlinedIcon />
                </IconButton>
              </Tooltip>
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
                    color:
                      label === 1
                        ? theme.palette.getContrastText(
                            theme.palette.tertiary.main,
                          )
                        : label === 0
                          ? theme.palette.getContrastText(
                              theme.palette.grey[600],
                            )
                          : theme.palette.action.primary,
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
                        label === 1 ? "Change to irrelevant" : "Label relevant"
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
          <NoteDialog
            project_id={project_id}
            record_id={record_id}
            open={showNotesDialog}
            onClose={toggleShowNotesDialog}
            note={note}
          />
        </CardActions>
      </Box>
    </Stack>
  );
};

export default RecordCardLabeler;
