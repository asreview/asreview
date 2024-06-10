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

const TagsTable = ({ tags, tagValues, setTagValues }) => {
  // console.log(tagValues)
  // if (!tagValues){
  //   console.log("tagValues is null")
  //   tagValues = tags.map(group => ({...group, values: group.values.map(tag => ({...tag}))}));
  // }

  const handleTagValueChange = (isChecked, group_index, tag_index) => {
    console.log(group_index, tag_index, isChecked);
    tagValues[group_index].values[tag_index].checked = isChecked;
    // console.log(tagValues)
    // console.log(tagValues.map(el => ({...el, values: el.values.map(el => ({...el, checked: isChecked}))})))

    console.log(tagValues);
    setTagValues(tagValues);
  };

  return (
    <Root>
      <Box>
        {tags.map((group, group_index) => (
          <Card elevation={2} className={classes.groupCard} key={group.id}>
            <CardContent>
              <Typography variant="h6">{group.name}</Typography>
              <FormGroup row={true}>
                {group.values.map((tag, tag_index) => (
                  <FormControlLabel
                    key={`${group.id}-${tag.id}`}
                    control={
                      <Checkbox
                        checked={
                          tagValues[group_index]?.values[tag_index]?.checked
                        }
                        onChange={(e) => {
                          handleTagValueChange(
                            e.target.checked,
                            group_index,
                            tag_index,
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
