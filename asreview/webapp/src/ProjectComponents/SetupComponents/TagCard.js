import React from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Popover,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ProjectContext } from "context/ProjectContext";
import { useContext } from "react";
import { LoadingCardHeader } from "StyledComponents/LoadingCardheader";

import { ProjectAPI } from "api";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { Add } from "@mui/icons-material";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import StyleIcon from "@mui/icons-material/Style";
import Grid from "@mui/material/Grid2";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";
import { TypographySubtitle1Medium } from "StyledComponents/StyledTypography";

import EditIcon from "@mui/icons-material/Edit";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { useToggle } from "hooks/useToggle";

const InfoPopover = ({ anchorEl, handlePopoverClose }) => {
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handlePopoverClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: 350,
        },
      }}
    >
      <Box
        sx={(theme) => ({
          p: 3,
          maxHeight: "80vh",
          overflow: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: theme.palette.grey[300],
            borderRadius: "4px",
            "&:hover": {
              background: theme.palette.grey[400],
            },
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
            borderRadius: "4px",
          },
          scrollbarWidth: "thin",
          scrollbarColor: `${theme.palette.grey[300]} transparent`,
        })}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Organizing with Tags
            </Typography>
            <Typography variant="body2" align="justify">
              Tags allow you to categorize records based on specific criteria,
              such as reasons for inclusion/exclusion, study characteristics, or
              quality assessment.
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              Using tags consistently throughout your screening will make your
              data analysis easier after you export your project
            </Alert>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Tag Structure
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={6}>
                <Box
                  sx={(theme) => ({
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    height: "100%",
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "background.paper"
                        : "transparent",
                  })}
                >
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <FolderOpenIcon sx={{ color: "text.secondary" }} />
                      <Typography variant="subtitle2">Tag Groups</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Create categories like "Reasons for Exclusion" or "Study
                      Design"
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
              <Grid xs={6}>
                <Box
                  sx={(theme) => ({
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    height: "100%",
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "background.paper"
                        : "transparent",
                  })}
                >
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BookmarksIcon sx={{ color: "text.secondary" }} />
                      <Typography variant="subtitle2">Tags</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Add specific labels like "Wrong Population" or "Randomized
                      Controlled Trial"
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
              <Grid xs={6}>
                <Box
                  sx={(theme) => ({
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    height: "100%",
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "background.paper"
                        : "transparent",
                  })}
                >
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <StyleIcon sx={{ color: "text.secondary" }} />
                      <Typography variant="subtitle2">Organization</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Group related concepts together for better overview
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Button
              href="https://asreview.readthedocs.io/en/latest/guides/tagging.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </Button>
          </Box>
        </Stack>
      </Box>
    </Popover>
  );
};

function labelToExport(label) {
  // Generate a suggested ID based on label
  // since Ids may be used later in data analysis code we suggest simple ascii
  // with no spaces but this is not required
  return label
    .toLowerCase()
    .replaceAll(/\s+/g, "_")
    .replaceAll(/[^a-z0-9_]/g, "");
}

const MutateGroupDialog = ({ project_id, open, onClose, group = null }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [state, setState] = React.useState(
    group || {
      label: "",
      export: "",
      values: [
        {
          label: "",
          export: "",
        },
        {
          label: "",
          export: "",
        },
        {
          label: "",
          export: "",
        },
      ],
    },
  );

  const { mutate: createTagGroup, error: createError } = useMutation(
    ProjectAPI.createTagGroup,
    {
      mutationKey: ["createTagGroup"],
      onSuccess: () => {
        queryClient.invalidateQueries(["fetchTagGroups", { project_id }]);
        closeDialog();
      },
      onError: (error) => {
        console.error("An error occurred while saving the tag group:", error);
      },
    },
  );

  const { mutate: mutateTagGroup, error: mutateError } = useMutation(
    ProjectAPI.mutateTagGroup,
    {
      mutationKey: ["mutateTagGroup"],
      onSuccess: () => {
        queryClient.invalidateQueries(["fetchTagGroups", { project_id }]);
        closeDialog();
      },
      onError: (error) => {
        console.error("An error occurred while saving the tag group:", error);
      },
    },
  );

  const handleGroupLabelChange = (e) => {
    setState((prev) => ({
      ...prev,
      label: e.target.value,
      export: labelToExport(e.target.value),
    }));
  };

  const handleGroupExportChange = (e) => {
    setState((prev) => ({
      ...prev,
      export: e.target.value,
    }));
  };

  const handleTagLabelChange = (index, e) => {
    setState((prev) => ({
      ...prev,
      values: prev.values.map((tag, i) =>
        i === index
          ? {
              ...tag,
              label: e.target.value,
              export: labelToExport(e.target.value),
            }
          : tag,
      ),
    }));
  };

  const handleTagExportChange = (index, e) => {
    setState((prev) => ({
      ...prev,
      values: prev.values.map((tag, i) =>
        i === index ? { ...tag, export: e.target.value } : tag,
      ),
    }));
  };

  const addTag = () => {
    setState((prev) => ({
      ...prev,
      values: [
        ...prev.values,
        {
          label: "",
          export: "",
        },
      ],
    }));
  };

  const closeDialog = () => {
    if (group == null) {
      setState({
        label: "",
        export: "",
        values: [
          {
            label: "",
            export: "",
          },
          {
            label: "",
            export: "",
          },
          {
            label: "",
            export: "",
          },
        ],
      });
    }
    onClose();
  };

  const onSave = () => {
    if (group !== null) {
      mutateTagGroup({
        project_id,
        group: {
          ...state,
          values: state.values.filter((tag) => tag.label && tag.export),
        },
      });
    } else {
      createTagGroup({
        project_id,
        group: {
          ...state,
          values: state.values.filter((tag) => tag.label && tag.export),
        },
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      fullScreen={smallScreen}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {group !== null ? "Edit group of tags" : "Add group of tags"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <TypographySubtitle1Medium>Group</TypographySubtitle1Medium>
          <Stack direction="row" spacing={3}>
            <TextField
              fullWidth
              id="group-label"
              label="Label"
              value={state.label}
              onChange={handleGroupLabelChange}
              helperText=" "
            />
            <TextField
              fullWidth
              id="group-id"
              label="Export name"
              value={state.export}
              onChange={handleGroupExportChange}
            />
          </Stack>
        </Stack>
        <Stack spacing={3}>
          <TypographySubtitle1Medium>Tags</TypographySubtitle1Medium>
          {state.values.map((tag, index) => (
            <Stack direction="row" spacing={3} key={index}>
              <TextField
                fullWidth
                id={`tag-label-${index}`}
                label="Label"
                value={tag.label}
                onChange={(e) => handleTagLabelChange(index, e)}
              />
              <TextField
                fullWidth
                id={`tag-id-${index}`}
                label="Export name"
                value={tag.export}
                onChange={(e) => handleTagExportChange(index, e)}
              />
            </Stack>
          ))}
        </Stack>
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="baseline"
          spacing={2}
        >
          <Tooltip title="Add tag">
            <IconButton aria-label="add tag" onClick={addTag}>
              <Add />
            </IconButton>
          </Tooltip>
        </Stack>

        {mutateError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {mutateError?.message}
          </Alert>
        )}
        {createError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {createError?.message}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Cancel</Button>
        <Button
          onClick={onSave}
          disabled={
            !state.label ||
            !state.export ||
            state.values.filter((tag) => tag.label && tag.export).length === 0
          }
        >
          {group !== null ? "Save" : "Create Group"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Group = ({ project_id, group }) => {
  const [dialogOpen, toggleDialogOpen] = useToggle();

  return (
    <Card sx={{ mb: 2, bgcolor: "background.default" }}>
      <CardHeader
        title={group.label}
        action={
          <Tooltip title="Edit Group">
            <IconButton onClick={toggleDialogOpen}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        {group.values.map((t, index) => (
          <Chip key={index} label={`${t.label} (${t.export})`} sx={{ m: 1 }} />
        ))}
      </CardContent>
      <MutateGroupDialog
        key={group.id}
        project_id={project_id}
        open={dialogOpen}
        onClose={toggleDialogOpen}
        group={group}
      />
    </Card>
  );
};

const TagCard = () => {
  const project_id = useContext(ProjectContext);
  const [dialogOpen, toggleDialogOpen] = useToggle();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const { data, isLoading } = useQuery(
    ["fetchTagGroups", { project_id: project_id }],
    ProjectAPI.fetchTagGroups,
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <Card>
      <LoadingCardHeader
        title="Labeling tags"
        subheader="Tags and tag groups are used to label records with additional information"
        isLoading={isLoading}
        action={
          <IconButton
            onClick={(event) => {
              setAnchorEl(event.currentTarget);
            }}
          >
            <StyledLightBulb />
          </IconButton>
        }
      />

      <InfoPopover
        anchorEl={anchorEl}
        handlePopoverClose={() => {
          setAnchorEl(null);
        }}
      />

      <CardContent>
        {isLoading ? (
          <Skeleton variant="rectangular" height={56} />
        ) : (
          <>
            {data.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Your tags will appear here
              </Alert>
            )}
            {data.map((c, index) => (
              <Group key={index} group={c} project_id={project_id} />
            ))}
          </>
        )}
      </CardContent>

      <CardContent>
        {isLoading ? (
          <Skeleton variant="rectangular" width={100} height={36} />
        ) : (
          <>
            <MutateGroupDialog
              project_id={project_id}
              open={dialogOpen}
              onClose={toggleDialogOpen}
            />
            <Button onClick={toggleDialogOpen} variant="contained">
              Add tags
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TagCard;
