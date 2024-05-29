import React from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Card,
  CardContent,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import "./ReviewPage.css";

const PREFIX = "TagsTable";

const classes = {
  groupCard: `${PREFIX}-groupCard`,
  title: `${PREFIX}-title`,
};

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 0 auto",
  margin: "auto",
  maxWidth: 960,
  padding: "108px 0px 32px 0px",
  height: "100%",

  [`& .${classes.groupCard}`]: {
    borderRadius: 16,
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },

  [`& .${classes.title}`]: {
    lineHeight: 1.2,
  },
}));

const TagsTable = (props) => {
  const handleTagValueChange = (isChecked, groupId, tagId) => {
    let tagValues;

    console.log(groupId);
    console.log(tagId);

    if (isChecked) {
      tagValues = {
        ...props.tagValues,
        [groupId]:
          props.tagValues[groupId] === undefined
            ? [tagId]
            : [...props.tagValues[groupId], tagId],
      };
    } else {
      tagValues = {
        ...props.tagValues,
        [groupId]: props.tagValues[groupId].filter((value) => value !== tagId),
      };
    }

    props.setTagValues(tagValues);
  };

  const isChecked = (groupId, tagId) => {
    if (props.tagValues[groupId] === undefined) {
      return false;
    } else {
      return props.tagValues[groupId].includes(tagId);
    }
  };

  return (
    <Root>
      <Box>
        {props.tags.map((group) => (
          <Card elevation={2} className={classes.groupCard} key={group.id}>
            <CardContent>
              <Typography variant="h6">{group.name}</Typography>
              <FormGroup row={true}>
                {group.values.map((tag) => (
                  <FormControlLabel
                    key={`${group.id}-${tag.id}`}
                    control={
                      <Checkbox
                        checked={isChecked(group.id, tag.id)}
                        onChange={(e) => {
                          handleTagValueChange(
                            e.target.checked,
                            group.id,
                            tag.id,
                          );
                        }}
                      />
                    }
                    label={tag.name}
                  />
                ))}
              </FormGroup>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Root>
  );
};

export default TagsTable;
