import React from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Stack,
  TextField,
  Typography,
  IconButton,
  Popover,
  Box,
  Divider,
} from "@mui/material";
import { ProjectContext } from "context/ProjectContext";
import { useContext } from "react";
import { LoadingCardHeader } from "StyledComponents/LoadingCardheader";

import { ProjectAPI } from "api";
import { useMutation, useQuery } from "react-query";

import { TypographySubtitle1Medium } from "StyledComponents/StyledTypography";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import StyleIcon from "@mui/icons-material/Style";
import Grid from "@mui/material/Grid2";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import AnalyticsIcon from "@mui/icons-material/Analytics";

const Tag = (props) => {
  return (
    <Stack direction="row" spacing={3}>
      <TextField
        fullWidth
        id={`project-tag-name-${props.tag.id}`}
        label="Tag Name"
        name="tag-name"
        onChange={(event) =>
          props.editTag(props.tag.id, {
            ...props.tag,
            name: event.target.value,
          })
        }
        value={props.tag.name}
      />
      <TextField
        fullWidth
        id={`project-tag-id-${props.tag.id}`}
        label="Tag Id"
        name="tag-id"
        disabled={true}
        value={props.tag.id}
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

const AddTagDialog = (props) => {
  const [name, setName] = React.useState("");
  const [id, setId] = React.useState("");
  const [idEdited, setIdEdited] = React.useState(false);

  const reset = () => {
    setName("");
    setId("");
    setIdEdited(false);
  };

  const addClicked = () => {
    props.handleAdd(id, name);
    props.handleClose();
    reset();
  };

  const handleClose = () => {
    props.handleClose();
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

  const duplicatedId = props.tags.some((t) => t.id === id);
  return (
    <Dialog open={props.open} onClose={handleClose}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.contentText}</DialogContentText>
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

const AddGroupDialog = (props) => {
  const emptyTag = { id: "", name: "", idEdited: false };

  const [name, setName] = React.useState("");
  const [id, setId] = React.useState("");
  const [idEdited, setIdEdited] = React.useState(false);
  const [tags, setTags] = React.useState([emptyTag]);

  const reset = () => {
    setName("");
    setId("");
    setIdEdited(false);
    setTags([emptyTag]);
  };

  const addClicked = () => {
    let values = tags.filter((t) => t.id !== "" && t.name !== "");
    values = values.map((t) => {
      return { id: t.id, name: t.name };
    });
    props.handleAdd(id, name, values);
    props.handleClose();
    reset();
  };

  const handleClose = () => {
    props.handleClose();
    reset();
  };

  const editTag = (newName, newId, index) => {
    setTags(
      tags.map((t, i) => {
        if (i === index) {
          // Editing if
          if (t.id !== newId) {
            //
            t.id = newId;
            t.idEdited = true;
          }
          if (t.name !== newName) {
            t.name = newName;
            if (!t.idEdited) {
              t.id = nameToId(newName);
            }
          }
        }
        return t;
      }),
    );
  };

  const addTag = () => {
    setTags([...tags, { id: "", name: "", idEdited: false }]);
  };

  const duplicatedGroupId = props.groups.some((c) => c.id === id);

  const tagsUnique = idsUnique(tags);

  const tagsValid = tags.filter((t) => t.id !== "" && t.name !== "").length > 0;

  return (
    <Dialog open={props.open} onClose={handleClose}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.contentText}</DialogContentText>
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
              helperText={duplicatedGroupId ? "Group Ids must be unique" : " "}
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
          <Button aria-label="add tag" onClick={addTag}>
            Add Tag
          </Button>
        </Stack>

        <Typography variant="body2" sx={{ color: "text.secondary", pt: 2 }}>
          Export labels are available when exporting your results. They must be
          unique and can't be changed after creating the group.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={addClicked}
          disabled={name === "" || id === "" || !tagsValid || !tagsUnique}
        >
          Create Group
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Group = (props) => {
  const [newTagDialogOpen, setNewTagDialogOpen] = React.useState(false);

  const addTag = (id, name) => {
    props.editTagGroup(props.group.id, {
      ...props.group,
      values: [...props.group.values, { id: id, name: name }],
    });
  };

  const editTag = (id, updatedTag) => {
    const updatedTagIndex = props.group.values.findIndex((el) => el.id === id);
    props.editTagGroup(props.group.id, {
      ...props.group,
      values: [
        ...props.group.values.slice(0, updatedTagIndex),
        updatedTag,
        ...props.group.values.slice(updatedTagIndex + 1),
      ],
    });
  };

  return (
    <Accordion elevation={0} sx={{ bgcolor: `primary.background` }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack
          direction={!props.mobileScreen ? "row" : "column"}
          sx={{ width: "100%" }}
        >
          <Typography
            sx={{ width: !props.mobileScreen ? "33%" : "100%", flexShrink: 0 }}
          >
            {props.group.name}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {props.group.values.map((t) => t.name).join(", ")}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <AddTagDialog
          title="Create Tag"
          text="Create a tag. The id can't be changed after creation."
          open={newTagDialogOpen}
          handleClose={() => setNewTagDialogOpen(false)}
          handleAdd={addTag}
          tags={props.group.values}
        />

        <Stack spacing={3}>
          <TypographySubtitle1Medium>Tag group</TypographySubtitle1Medium>
          <Stack direction="row" spacing={3}>
            <TextField
              fullWidth
              id="tag-group-name"
              label="Group"
              onChange={(event) =>
                props.editTagGroup(props.group.id, {
                  ...props.group,
                  name: event.target.value,
                })
              }
              value={props.group.name}
            />
            <TextField
              fullWidth
              id="tag-group-id"
              label="Group Id"
              disabled={true}
              onChange={(event) =>
                props.editTagGroup(props.group.id, {
                  ...props.group,
                  id: event.target.value,
                })
              }
              value={props.group.id}
            />
          </Stack>
          <TypographySubtitle1Medium>Tags</TypographySubtitle1Medium>
          {props.group.values.map((t) => (
            <Tag tag={t} key={t.id} editTag={editTag} />
          ))}
        </Stack>
      </AccordionDetails>
      <AccordionActions>
        <Button onClick={() => setNewTagDialogOpen(true)}>Add Tag</Button>
      </AccordionActions>
    </Accordion>
  );
};

const TagCard = (props) => {
  const [groupDialogOpen, setGroupDialogOpen] = React.useState(false);
  const [tags, setTags] = React.useState([]);
  const project_id = useContext(ProjectContext);
  const [anchorEl, setAnchorEl] = React.useState(null);

  /**
   * Fetch project info
   */
  const { isLoading } = useQuery(
    ["fetchInfo", { project_id: project_id }],
    ProjectAPI.fetchInfo,
    {
      onSuccess: (data) => {
        setTags(
          data["tags"] === undefined || data["tags"] === null
            ? []
            : data["tags"],
        );
      },
      refetchOnWindowFocus: false,
    },
  );

  /**
   * Mutate project info
   */
  const { isLoading: isMutatingInfo, mutate } = useMutation(
    ProjectAPI.mutateInfo,
    {
      mutationKey: ["mutateInfo"],
      onError: () => {
        // handle the error
      },
      onSuccess: (data) => {
        setTags(
          data["tags"] === undefined || data["tags"] === null
            ? []
            : data["tags"],
        );
      },
    },
  );

  const editTagGroup = (id, updatedGroup) => {
    const updatedGroupIndex = tags.findIndex((el) => el.id === id);
    if (updatedGroupIndex >= 0) {
      mutate({
        tags: [
          ...tags.slice(0, updatedGroupIndex),
          updatedGroup,
          ...tags.slice(updatedGroupIndex + 1),
        ],
        project_id: project_id,
      });
    }
  };
  const addTagGroup = (id, name, values) => {
    mutate({
      // add new group to tags
      tags: [...tags, { name: name, values: values, id: id }],
      project_id: project_id,
    });
  };

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card sx={{ position: "relative" }}>
      <LoadingCardHeader
        title="Labeling tags"
        subheader="Tags and tag groups are used to label records with additional information."
        isLoading={isLoading}
      />

      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <IconButton size="small" onClick={handlePopoverOpen}>
          <StyledLightBulb fontSize="small" />
        </IconButton>
      </Box>

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
              background: (theme) => theme.palette.grey[300],
              borderRadius: "4px",
              "&:hover": {
                background: (theme) => theme.palette.grey[400],
              },
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
              borderRadius: "4px",
            },
            scrollbarWidth: "thin",
            scrollbarColor: (theme) => `${theme.palette.grey[300]} transparent`,
          })}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Organizing with Tags
              </Typography>
              <Typography variant="body2" align="justify">
                Tags help you categorize and analyze your records
                systematically. Create meaningful groups and labels to track
                important aspects of your review.
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <FolderOpenIcon sx={{ color: "text.secondary" }} />
                        <Typography variant="subtitle2">Tag Groups</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Create categories like "Study Design" or "Population
                        Type"
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <StyleIcon sx={{ color: "text.secondary" }} />
                        <Typography variant="subtitle2">
                          Organization
                        </Typography>
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
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

      <CardContent>
        {isLoading ? (
          <Skeleton variant="rectangular" height={56} />
        ) : (
          <>
            {tags.length !== 0 &&
              tags.map((c) => (
                <Group
                  group={c}
                  key={c.id}
                  editTagGroup={editTagGroup}
                  mobileScreen={props.mobileScreen}
                />
              ))}
            <AddGroupDialog
              title="Add group of tags"
              open={groupDialogOpen}
              handleClose={() => setGroupDialogOpen(false)}
              handleAdd={addTagGroup}
              handleAddTags={editTagGroup}
              groups={tags}
            />
          </>
        )}
      </CardContent>

      <CardContent>
        {isLoading ? (
          <Skeleton variant="rectangular" width={100} height={36} />
        ) : (
          <Button
            onClick={() => setGroupDialogOpen(true)}
            disabled={isMutatingInfo}
            variant="contained"
          >
            Add tags
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TagCard;
