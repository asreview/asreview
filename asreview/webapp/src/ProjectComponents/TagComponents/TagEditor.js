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

import { ExpandMore } from "@mui/icons-material";

import { TypographySubtitle1Medium } from "../../StyledComponents/StyledTypography.js";

const Tag = (props) => {
  return (
    <Stack direction="row" spacing={3}>
      <TextField
        fullWidth
        id={`project-tag-name-${props.tag.id}`}
        inputProps={{
          onFocus: () => props.onFocus(),
          onBlur: () => props.onBlur(),
        }}
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
        inputProps={{
          onFocus: () => props.onFocus(),
          onBlur: () => props.onBlur(),
        }}
        label="Tag Id"
        name="tag-id"
        disabled={true}
        value={props.tag.id}
      />
    </Stack>
  );
};

const AddDialog = (props) => {
  const [name, setName] = React.useState("");
  const [id, setId] = React.useState("");

  const reset = () => {
    setName("");
    setId("");
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
              onChange={(event) => setName(event.target.value)}
            />
            <TextField
              fullWidth
              id="tag-id"
              label="Id"
              value={id}
              onChange={(event) => setId(event.target.value)}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={addClicked} disabled={name === "" || id === ""}>
          Add
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
      <AccordionSummary expandIcon={<ExpandMore />}>
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
        <AddDialog
          title="Create Tag"
          text="Create a tag. The id can't be changed after creation."
          open={newTagDialogOpen}
          handleClose={() => setNewTagDialogOpen(false)}
          handleAdd={addTag}
        />

        <Stack spacing={3}>
          <TypographySubtitle1Medium>Name</TypographySubtitle1Medium>
          <Stack direction="row" spacing={3}>
            <TextField
              fullWidth
              id="tag-category-name"
              inputProps={{
                onFocus: () => props.onFocus(),
                onBlur: () => props.onBlur(),
              }}
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
              inputProps={{
                onFocus: () => props.onFocus(),
                onBlur: () => props.onBlur(),
              }}
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
            <Tag
              tag={t}
              key={t.id}
              editTag={editTag}
              onBlur={props.onBlur}
              onFocus={props.onFocus}
            />
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

  let tags = props.tags;

  const editTagCategory = (id, updatedCategory) => {
    const updatedCategoryIndex = props.tags.findIndex((el) => el.id === id);
    if (updatedCategoryIndex >= 0) {
      props.handleTagChange([
        ...props.tags.slice(0, updatedCategoryIndex),
        updatedCategory,
        ...props.tags.slice(updatedCategoryIndex + 1),
      ]);
    }
  };
  const addTagCategory = (id, name) => {
    props.handleTagChange([...tags, { name: name, values: [], id: id }]);
  };

  return (
    <Accordion elevation={3}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography
          sx={{ width: !props.mobileScreen ? "33%" : "100%", flexShrink: 0 }}
        >
          Tags
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TypographySubtitle1Medium>Categories</TypographySubtitle1Medium>
        <AddDialog
          title="Add Category"
          text="Create a tag category. The id can't be changed after creation."
          open={categoryDialogOpen}
          handleClose={() => setCategoryDialogOpen(false)}
          handleAdd={addTagCategory}
        />
        {tags.map((c) => (
          <Category
            category={c}
            key={c.id}
            editTagCategory={editTagCategory}
            mobileScreen={props.mobileScreen}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
          />
        ))}
      </AccordionDetails>
      <AccordionActions>
        <Button onClick={() => setCategoryDialogOpen(true)}>
          Add Category
        </Button>
      </AccordionActions>
    </Accordion>
  );
};

export default TagEditor;
