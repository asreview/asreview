import React from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from "@mui/material";

const TagsTable = ({
  tagsForm,
  setTagValues,
  tagValues = null,
  disabled = false,
}) => {
  const handleTagValueChange = (isChecked, groupId, tagId) => {
    let groupI = tagValues.findIndex((group) => group.id === groupId);
    let tagI = tagValues[groupI].values.findIndex((tag) => tag.id === tagId);

    let tagValuesCopy = tagValues;
    tagValuesCopy[groupI].values[tagI]["checked"] = isChecked;

    setTagValues(tagValuesCopy);
  };

  return (
    <>
      {tagsForm &&
        tagsForm.map((group, i) => (
          <Box key={group.id}>
            <Typography variant="h6">{group.name}</Typography>
            <FormGroup row={true}>
              {group.values.map((tag, j) => (
                <FormControlLabel
                  key={`${group.id}:${tag.id}`}
                  control={
                    <Checkbox
                      checked={tagValues[i]?.values[j]?.checked}
                      onChange={(e) => {
                        handleTagValueChange(
                          e.target.checked,
                          group.id,
                          tag.id,
                        );
                      }}
                      disabled={disabled}
                    />
                  }
                  label={tag.name}
                />
              ))}
            </FormGroup>
          </Box>
        ))}
    </>
  );
};

export default TagsTable;
