import React from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  TextField,
  Stack,
  Typography,
  AccordionActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import { useMutation, useQuery } from "react-query";
import { ProjectAPI } from "../../api/index.js";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { TypographySubtitle1Medium } from "../../StyledComponents/StyledTypography.js";

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
              label="Id"
              helperText={
                duplicatedId
                  ? "Tag Ids must be unique within the category"
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

const AddCategoryDialog = (props) => {
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

  const duplicatedCategoryId = props.categories.some((c) => c.id === id);

  const tagsUnique = idsUnique(tags);

  const tagsValid = tags.filter((t) => t.id !== "" && t.name !== "").length > 0;

  return (
    <Dialog open={props.open} onClose={handleClose}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.contentText}</DialogContentText>
        <Stack spacing={3}>
          <TypographySubtitle1Medium>
            Category Details
          </TypographySubtitle1Medium>
          <Stack direction="row" spacing={3}>
            <TextField
              fullWidth
              id="category-name"
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
              id="category-id"
              label="Id"
              value={id}
              onChange={(event) => {
                setId(event.target.value);
                setIdEdited(true);
              }}
              helperText={
                duplicatedCategoryId ? "Category Ids must be unique" : " "
              }
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
                label="Id"
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

        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Ids must be unique and can't be changed after creating the category.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={addClicked}
          disabled={name === "" || id === "" || !tagsValid || !tagsUnique}
        >
          Create Category
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Category = (props) => {
  const [newTagDialogOpen, setNewTagDialogOpen] = React.useState(false);

  const addTag = (id, name) => {
    props.editTagCategory(props.category.id, {
      ...props.category,
      values: [...props.category.values, { id: id, name: name }],
    });
  };

  const editTag = (id, updatedTag) => {
    const updatedTagIndex = props.category.values.findIndex(
      (el) => el.id === id,
    );
    props.editTagCategory(props.category.id, {
      ...props.category,
      values: [
        ...props.category.values.slice(0, updatedTagIndex),
        updatedTag,
        ...props.category.values.slice(updatedTagIndex + 1),
      ],
    });
  };

  return (
    <Accordion elevation={3}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack
          direction={!props.mobileScreen ? "row" : "column"}
          sx={{ width: "100%" }}
        >
          <Typography
            sx={{ width: !props.mobileScreen ? "33%" : "100%", flexShrink: 0 }}
          >
            {props.category.name}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {props.category.values.map((t) => t.name).join(", ")}
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
          tags={props.category.values}
        />

        <Stack spacing={3}>
          <TypographySubtitle1Medium>Name</TypographySubtitle1Medium>
          <Stack direction="row" spacing={3}>
            <TextField
              fullWidth
              id="tag-category-name"
              label="Category Name"
              onChange={(event) =>
                props.editTagCategory(props.category.id, {
                  ...props.category,
                  name: event.target.value,
                })
              }
              value={props.category.name}
            />
            <TextField
              fullWidth
              id="tag-category-id"
              label="Category Id"
              disabled={true}
              onChange={(event) =>
                props.editTagCategory(props.category.id, {
                  ...props.category,
                  id: event.target.value,
                })
              }
              value={props.category.id}
            />
          </Stack>
          <TypographySubtitle1Medium>Tags</TypographySubtitle1Medium>
          {props.category.values.map((t) => (
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

const TagEditor = (props) => {
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false);
  const [tags, setTags] = React.useState([]);

  /**
   * Fetch project info
   */
  useQuery(
    ["fetchInfo", { project_id: props.project_id }],
    ProjectAPI.fetchInfo,
    {
      enabled: props.project_id !== null,
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

  const editTagCategory = (id, updatedCategory) => {
    const updatedCategoryIndex = tags.findIndex((el) => el.id === id);
    if (updatedCategoryIndex >= 0) {
      mutate({
        tags: [
          ...tags.slice(0, updatedCategoryIndex),
          updatedCategory,
          ...tags.slice(updatedCategoryIndex + 1),
        ],
        project_id: props.project_id,
      });
    }
  };
  const addTagCategory = (id, name, values) => {
    mutate({
      // add new category to tags
      tags: [...tags, { name: name, values: values, id: id }],
      project_id: props.project_id,
    });
  };

  return (
    <Accordion elevation={3} onBlur={props.onBlur} onFocus={props.onFocus}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography
          sx={{ width: !props.mobileScreen ? "33%" : "100%", flexShrink: 0 }}
        >
          Tags
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Tags provide additional context for your review. They are not used by
          the machine learning algorithms.
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TypographySubtitle1Medium>Categories</TypographySubtitle1Medium>
        <AddCategoryDialog
          title="Add Category"
          text="Create a tag category. The ids can't be changed after creation."
          open={categoryDialogOpen}
          handleClose={() => setCategoryDialogOpen(false)}
          handleAdd={addTagCategory}
          handleAddTags={editTagCategory}
          categories={tags}
        />
        {tags.map((c) => (
          <Category
            category={c}
            key={c.id}
            editTagCategory={editTagCategory}
            mobileScreen={props.mobileScreen}
          />
        ))}
      </AccordionDetails>
      <AccordionActions>
        <Button
          onClick={() => setCategoryDialogOpen(true)}
          disabled={isMutatingInfo}
        >
          Add Category
        </Button>
      </AccordionActions>
    </Accordion>
  );
};

export default TagEditor;
