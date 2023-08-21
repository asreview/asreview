import React from "react";
import { styled } from "@mui/material/styles";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  TextField,
  Stack,
  Typography,
  AccordionActions,
} from "@mui/material";

import { ExpandMore } from "@mui/icons-material";

import { TypographySubtitle1Medium } from "../../StyledComponents/StyledTypography.js";

const Tag = (props) => {
  return (
    <TextField
      fullWidth
      id={`project-tag-${props.tag.id}`}
      /*inputProps={{
      onFocus: () => onFocus(),
      onBlur: () => onBlur(),
    }}*/
      label="Tag Name"
      name="tag"
      //onChange={handleInfoChange}
      value={props.tag.name}
    />
  );
};

const Category = (props) => {
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
            {props.name}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {props.values.map((t) => t.name).join(", ")}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3}>
          <TypographySubtitle1Medium>Name</TypographySubtitle1Medium>
          <TextField
            fullWidth
            id="project-author"
            /*inputProps={{
                    onFocus: () => onFocus(),
                    onBlur: () => onBlur(),
                  }}*/
            label="Category Name"
            name="categories"
            //onChange={handleInfoChange}
            value={props.name}
          />
          <TypographySubtitle1Medium>Tags</TypographySubtitle1Medium>
          {props.values.map((t) => (
            <Tag tag={t} key={t.id} />
          ))}
        </Stack>
      </AccordionDetails>
      <AccordionActions>
        <Button>Add Tag</Button>
      </AccordionActions>
    </Accordion>
  );
};

const TagEditor = (props) => {
  let tags = props.tags;
  if (tags === undefined) {
    tags = [];
  }

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
        {tags.map((c) => (
          <Category name={c.name} values={c.values} key={c.id} />
        ))}
      </AccordionDetails>
      <AccordionActions>
        <Button>Add Category</Button>
      </AccordionActions>
    </Accordion>
  );
};

export default TagEditor;
