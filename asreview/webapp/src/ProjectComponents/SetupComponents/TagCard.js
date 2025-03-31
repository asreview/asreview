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

function nameToId(name) {
  // Generate a suggested ID based on name
  // since Ids may be used later in data analysis code we suggest simple ascii
  // with no spaces but this is not required
  return name
    .toLowerCase()
    .replaceAll(/\s+/g, "_")
    .replaceAll(/[^a-z0-9_]/g, "");
}

function idsUnique(items) {
  const idList = items.map((t) => t.id);
  const idSet = new Set(idList);
  return idSet.size === idList.length;
}

const MutateGroupDialog = ({
  open,
  onClose,
  title,
  groupId,
  isEditMode,
  project_id,
}) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const currentGroups = queryClient.getQueryData(["fetchTags", { project_id }]);
  const groupData = currentGroups.find((group) => group.id === groupId);

  const [formState, setFormState] = React.useState({
    name: groupData.name || "",
    id: groupData.id || "",
    idEdited: false,
    tags: groupData.values || [{ id: "", name: "", idEdited: false }],
  });

  const { mutate } = useMutation(ProjectAPI.mutateTags, {
    mutationKey: ["mutateTags"],
    onSuccess: () => {
      queryClient.invalidateQueries(["fetchTags", { project_id }]);
      onClose();
    },
    onError: (error) => {
      console
        .error(error)
        .message("An error occurred while saving the tag group.");
    },
  });

  const handleChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "name" && !prev.idEdited ? { id: nameToId(value) } : {}),
    }));
  };

  const handleTagChange = (index, field, value) => {
    setFormState((prev) => ({
      ...prev,
      tags: prev.tags.map((tag, i) =>
        i === index
          ? {
              ...tag,
              [field]: value,
              ...(field === "name" && !tag.idEdited
                ? { id: nameToId(value) }
                : {}),
              ...(field === "id" ? { idEdited: true } : {}),
            }
          : tag,
      ),
    }));
  };

  const addTag = () => {
    setFormState((prev) => ({
      ...prev,
      tags: [...prev.tags, { id: "", name: "", idEdited: false }],
    }));
  };

  const onSave = () => {
    const { name, id, tags } = formState;
    const values = tags.filter((t) => t.id && t.name);

    mutate({
      tags: isEditMode
        ? currentGroups.map((group) =>
            group.id === groupId ? { id, name, values } : group,
          )
        : [...currentGroups, { id, name, values }],
      project_id: project_id,
    });
  };

  const duplicatedGroupId =
    currentGroups.some((c) => c.id === formState.id) &&
    formState.id !== groupId;
  const tagsUnique = idsUnique(formState);
  const tagsValid = formState.filter((t) => t.id && t.name).length > 0;

  return (
    <Dialog open={open} onClose={onClose} fullScreen={smallScreen}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <TypographySubtitle1Medium>Group</TypographySubtitle1Medium>
          <Stack direction="row" spacing={3}>
            <TextField
              fullWidth
              id="group-name"
              label="Name"
              value={formState.name}
              onChange={(e) => handleChange("name", e.target.value)}
              helperText=" "
            />
            <TextField
              fullWidth
              id="group-id"
              label="Export label"
              value={formState.id}
              onChange={(e) => handleChange("id", e.target.value)}
              helperText={
                duplicatedGroupId ? "Group export labels must be unique" : " "
              }
              disabled={isEditMode}
            />
          </Stack>
        </Stack>
        <Stack spacing={3}>
          <TypographySubtitle1Medium>Tags</TypographySubtitle1Medium>
          {formState.map((tag, index) => (
            <Stack direction="row" spacing={3} key={index}>
              <TextField
                fullWidth
                id={`tag-name-${index}`}
                label="Name"
                value={tag.name}
                onChange={(e) => handleTagChange(index, "name", e.target.value)}
              />
              <TextField
                fullWidth
                id={`tag-id-${index}`}
                label="Export label"
                value={tag.id}
                onChange={(e) => handleTagChange(index, "id", e.target.value)}
                disabled={isEditMode && index < groupData.values.length}
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
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSave}
          disabled={
            !formState.name || !formState.id || !tagsValid || !tagsUnique
          }
        >
          {isEditMode ? "Save" : "Create Group"}
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
        title={group.name}
        action={
          <Tooltip title="Edit Group">
            <IconButton onClick={toggleDialogOpen}>
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
        project_id={project_id}
        title="Edit Group and Tags"
        open={dialogOpen}
        onClose={toggleDialogOpen}
        isEditMode={true}
        groupId={group.id}
      />
    </Card>
  );
};

const TagCard = () => {
  const project_id = useContext(ProjectContext);
  const [dialogOpen, toggleDialogOpen] = useToggle();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const { data, isLoading } = useQuery(
    ["fetchTags", { project_id: project_id }],
    ProjectAPI.fetchTags,
    {
      refetchOnWindowFocus: false,
    },
  );

  console.log(data);

  return (
    <Card>
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
          data.map((c) => (
            <Group key={c.id} group={c} project_id={project_id} />
          ))
        )}
      </CardContent>

      <CardContent>
        {isLoading ? (
          <Skeleton variant="rectangular" width={100} height={36} />
        ) : (
          <>
            <MutateGroupDialog
              project_id={project_id}
              title="Add group of tags"
              open={dialogOpen}
              onClose={toggleDialogOpen}
              isEditMode={false}
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
