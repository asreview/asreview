import React from "react";

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
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
  Chip,
  CardHeader,
} from "@mui/material";
import { ProjectContext } from "context/ProjectContext";
import { useContext } from "react";
import { LoadingCardHeader } from "StyledComponents/LoadingCardheader";

import { ProjectAPI } from "api";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { Add } from "@mui/icons-material";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import StyleIcon from "@mui/icons-material/Style";
import Grid from "@mui/material/Grid2";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";
import { TypographySubtitle1Medium } from "StyledComponents/StyledTypography";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import EditIcon from "@mui/icons-material/Edit";

const Tag = ({ tag, editTag }) => {
  return (
    <Stack direction="row" spacing={3}>
      <TextField
        fullWidth
        id={`project-tag-name-${tag.id}`}
        label="Tag Name"
        name="tag-name"
        onChange={(event) =>
          editTag(tag.id, {
            ...tag,
            name: event.target.value,
          })
        }
        value={tag.name}
      />
      <TextField
        fullWidth
        id={`project-tag-id-${tag.id}`}
        label="Tag Id"
        name="tag-id"
        disabled={true}
        value={tag.id}
      />
    </Stack>
  );
};

function nameToId(name) {
  // Generate a suggested ID based on name
  // since Ids may be used later in data analysis code we suggest simple ascii
  // with no spaces but this is not required
  return name
    .toLowerCase()
    .replaceAll(/\s+/g, "_")
    .replaceAll(/[^a-z0-9_]/g, "");
}

const AddTagDialog = ({ open, handleClose, handleAdd, title, tags }) => {
  const [name, setName] = React.useState("");
  const [id, setId] = React.useState("");
  const [idEdited, setIdEdited] = React.useState(false);

  const reset = () => {
    setName("");
    setId("");
    setIdEdited(false);
  };

  const addClicked = () => {
    handleAdd(id, name);
    handleClose();
    reset();
  };

  const editName = (newName) => {
    setName(newName);
    if (!idEdited) {
      setId(nameToId(newName));
    }
  };

  const editId = (newId) => {
    setId(newId);
    setIdEdited(true);
  };

  const duplicatedId = tags.some((t) => t.id === id);
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <TypographySubtitle1Medium>Name</TypographySubtitle1Medium>
          <Stack direction="row" spacing={3}>
            <TextField
              fullWidth
              id="tag-name"
              label="Name"
              value={name}
              helperText=" "
              onChange={(event) => editName(event.target.value)}
            />
            <TextField
              fullWidth
              id="tag-id"
              label="Export label"
              helperText={
                duplicatedId
                  ? "Export labels must be unique within the group"
                  : " "
              }
              value={id}
              onChange={(event) => editId(event.target.value)}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={addClicked}
          disabled={name === "" || id === "" || duplicatedId}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function idsUnique(items) {
  const idList = items.map((t) => t.id);
  const idSet = new Set(idList);
  return idSet.size === idList.length;
}

const MutateGroupDialog = ({
  open,
  handleClose,
  title,
  initialName,
  initialId,
  initialTags,
  groups,
  isEditMode,
  queryClient,
  project_id,
}) => {
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const emptyTag = { id: "", name: "", idEdited: false };

  const [name, setName] = React.useState(initialName || "");
  const [id, setId] = React.useState(initialId || "");
  const [idEdited, setIdEdited] = React.useState(false);
  const [tags, setTags] = React.useState(initialTags || [emptyTag]);

  const { mutate } = useMutation(ProjectAPI.mutateInfo, {
    mutationKey: ["mutateInfo"],
  });

  React.useEffect(() => {
    if (initialName) setName(initialName);
    if (initialId) setId(initialId);
    if (initialTags) setTags(initialTags);
  }, [initialName, initialId, initialTags]);

  const reset = () => {
    setName("");
    setId("");
    setIdEdited(false);
    setTags([emptyTag]);
  };

  const saveClicked = () => {
    let values = tags.filter((t) => t.id !== "" && t.name !== "");
    values = values.map((t) => {
      return { id: t.id, name: t.name };
    });

    queryClient.setQueryData(["fetchInfo", { project_id }], (oldData) => {
      const updatedTags = isEditMode
        ? oldData.tags.map((group) =>
            group.id === initialId ? { id, name, values } : group,
          )
        : [...oldData.tags, { id, name, values }];
      return { ...oldData, tags: updatedTags };
    });

    mutate({
      tags: isEditMode
        ? groups.map((group) =>
            group.id === initialId ? { id, name, values } : group,
          )
        : [...groups, { id, name, values }],
      project_id: project_id,
    });

    handleClose();
    reset();
  };

  const editTag = (newName, newId, index) => {
    setTags(
      tags.map((t, i) => {
        if (i === index) {
          if (t.name !== newName) {
            t.name = newName;
            if (!t.idEdited && (!isEditMode || index >= initialTags.length)) {
              t.id = nameToId(newName);
            }
          }
          if (t.id !== newId) {
            t.id = newId;
            t.idEdited = true;
          }
        }
        return t;
      }),
    );
  };

  const addTag = () => {
    setTags([...tags, { id: "", name: "", idEdited: false }]);
  };

  const duplicatedGroupId = groups.some((c) => c.id === id) && id !== initialId;

  const tagsUnique = idsUnique(tags);

  const tagsValid = tags.filter((t) => t.id !== "" && t.name !== "").length > 0;

  return (
    <Dialog open={open} onClose={handleClose} fullScreen={smallScreen}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <TypographySubtitle1Medium>Group</TypographySubtitle1Medium>
          <Stack direction="row" spacing={3}>
            <TextField
              fullWidth
              id="group-name"
              label="Name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (!idEdited) {
                  setId(nameToId(event.target.value));
                }
              }}
              helperText=" "
            />
            <TextField
              fullWidth
              id="group-id"
              label="Export label"
              value={id}
              onChange={(event) => {
                setId(event.target.value);
                setIdEdited(true);
              }}
              helperText={
                duplicatedGroupId ? "Group export labels must be unique" : " "
              }
              disabled={isEditMode}
            />
          </Stack>
        </Stack>
        <Stack spacing={3}>
          <TypographySubtitle1Medium>Tags</TypographySubtitle1Medium>
          {tags.map((t, index) => (
            <Stack direction="row" spacing={3} key={index}>
              <TextField
                fullWidth
                id="tag-name"
                label="Name"
                value={t.name}
                onChange={(event) => editTag(event.target.value, t.id, index)}
              />
              <TextField
                fullWidth
                id="tag-id"
                label="Export label"
                value={t.id}
                onChange={(event) => editTag(t.name, event.target.value, index)}
                disabled={isEditMode && index < initialTags.length}
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

        <Typography variant="body2" sx={{ color: "text.secondary", pt: 2 }}>
          Export labels are available when exporting your results. They must be
          unique and can't be changed after creating the group.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={saveClicked}
          disabled={name === "" || id === "" || !tagsValid || !tagsUnique}
        >
          {isEditMode ? "Save" : "Create Group"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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
          maxWidth: 320,
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
              Tags help you categorize and analyze your records systematically.
              Create meaningful groups and labels to track important aspects of
              your review.
            </Typography>
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
                      Create categories like "Study Design" or "Population Type"
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
                      Add specific labels like "RCT" or "Adult Population"
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
                      <AnalyticsIcon sx={{ color: "text.secondary" }} />
                      <Typography variant="subtitle2">Analysis</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Use consistent naming for easier data analysis later
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Button
            href="https://asreview.readthedocs.io/en/latest/guides/tagging.html"
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            size="small"
            sx={{ textTransform: "none", p: 0 }}
          >
            Learn more →
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
};

const Group = ({ group, groups }) => {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const project_id = useContext(ProjectContext);

  const handleEditSave = (id, name, values) => {
    queryClient.setQueryData(["fetchInfo", { project_id }], (oldData) => {
      const updatedTags = oldData.tags.map((g) =>
        g.id === group.id ? { id, name, values } : g,
      );
      return { ...oldData, tags: updatedTags };
    });
  };

  return (
    <Card sx={{ mb: 2, bgcolor: "background.default" }}>
      <CardHeader
        title={group.name}
        action={
          <Tooltip title="Edit Group">
            <IconButton onClick={() => setEditDialogOpen(true)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {group.values.map((t) => (
            <Chip key={t.id} label={`${t.name} (${t.id})`} />
          ))}
        </Stack>
      </CardContent>
      <MutateGroupDialog
        key={group.id}
        title="Edit Group and Tags"
        open={editDialogOpen}
        handleClose={() => setEditDialogOpen(false)}
        handleSave={handleEditSave}
        initialName={group.name}
        initialId={group.id}
        initialTags={group.values}
        groups={groups}
        isEditMode={true}
        queryClient={queryClient}
        project_id={project_id}
      />
    </Card>
  );
};

const TagCard = () => {
  const project_id = useContext(ProjectContext);
  const queryClient = useQueryClient();

  const [groupDialogOpen, setGroupDialogOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const { data, isLoading } = useQuery(
    ["fetchInfo", { project_id: project_id }],
    ProjectAPI.fetchInfo,
    {
      refetchOnWindowFocus: false,
    },
  );

  const tags = data?.tags || [];

  return (
    <Card sx={{ position: "relative" }}>
      <LoadingCardHeader
        title="Labeling tags"
        subheader="Tags and tag groups are used to label records with additional information."
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
          tags.map((c) => <Group group={c} key={c.id} groups={tags} />)
        )}
      </CardContent>

      <CardContent>
        {isLoading ? (
          <Skeleton variant="rectangular" width={100} height={36} />
        ) : (
          <>
            <MutateGroupDialog
              title="Add group of tags"
              open={groupDialogOpen}
              handleClose={() => setGroupDialogOpen(false)}
              groups={tags}
              queryClient={queryClient}
              project_id={project_id}
            />
            <Button
              onClick={() => setGroupDialogOpen(true)}
              variant="contained"
            >
              Add tags
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TagCard;
