import React from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import "./ReviewPage.css";

const TagsTable = ({
  tagsForm,
  setTagValues,
  tagValues = [],
  disabled = false,
}) => {
  console.log(tagsForm);

  const handleTagValueChange = (isChecked, groupId, tagId) => {
    // create a set and store the tag values
    let valuesSet = new Set(tagValues);

    if (isChecked) {
      valuesSet = valuesSet.add(`${groupId}:${tagId}`);
    } else {
      valuesSet.delete(`${groupId}:${tagId}`);
    }

    setTagValues([...valuesSet]);
  };

  return (
    <>
      {tagsForm &&
        tagsForm.map((group) => (
          <Box key={group.id}>
            <Typography variant="h6">{group.name}</Typography>
            <FormGroup row={true}>
              {group.values.map((tag) => (
                <FormControlLabel
                  key={`${group.id}:${tag.id}`}
                  control={
                    <Checkbox
                      checked={tagValues?.includes(`${group.id}:${tag.id}`)}
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
