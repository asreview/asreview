import * as React from "react";
import { useParams } from "react-router-dom";
import clsx from "clsx";
import { Box, Stack, TextField, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";

import { TypographySubtitle1Medium } from "../StyledComponents/StyledTypography.js";

const PREFIX = "ProjectInfoForm";

const classes = {
  root: `${PREFIX}-root`,
  textField: `${PREFIX}-textField`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    display: "flex",
  },
  [`& .${classes.textField}`]: {
    marginTop: 0,
  },
}));

const ProjectInfo = (props) => {
  const { project_id } = useParams();

  const isProjectSetup = () => {
    return !project_id;
  };

  const onFocus = () => {
    if (!isProjectSetup()) {
      // do nothing
    } else {
      props.setTextFieldFocused(true);
    }
  };

  const onBlur = () => {
    if (!isProjectSetup()) {
      // do nothing
    } else {
      props.setTextFieldFocused(false);
    }
  };

  const handleInfoChange = (event) => {
    if (!isProjectSetup()) {
      props.setInfo({
        ...props.info,
        [event.target.name]: event.target.value,
      });
      if (event.target.name === "title" && !event.target.value) {
        props.setDisableSaveButton(true);
      } else if (props.info?.title) {
        props.setDisableSaveButton(false);
      } else {
        // do nothing
      }
      props.setDisableUndoButton(false);
    } else {
      props.handleInfoChange(event);
    }
  };

  return (
    <Root className={classes.root}>
      <Stack spacing={3}>
        <Box>
          {isProjectSetup() && <div></div>}
          {!isProjectSetup() && (
            <TypographySubtitle1Medium>
              Project information
            </TypographySubtitle1Medium>
          )}
        </Box>
        <Box
          className={clsx({
            [classes.textField]: isProjectSetup(),
          })}
        >
          <Stack direction="column" spacing={3}>
            <Tooltip
              disableHoverListener
              title="Your project needs a title"
              arrow
              open={!props.isTitleValidated}
              placement="top-start"
            >
              <TextField
                autoFocus
                error={!props.isTitleValidated}
                fullWidth
                id="project-title"
                inputProps={{
                  onFocus: () => onFocus(),
                  onBlur: () => onBlur(),
                }}
                InputLabelProps={{
                  required: false,
                }}
                label="Title (required)"
                name="title"
                onChange={handleInfoChange}
                required
                value={props.info?.title}
              />
            </Tooltip>
            <TextField
              fullWidth
              id="project-author"
              inputProps={{
                onFocus: () => onFocus(),
                onBlur: () => onBlur(),
              }}
              label="Author(s)"
              name="authors"
              onChange={handleInfoChange}
              value={props.info?.authors}
            />
            <TextField
              fullWidth
              id="project-description"
              inputProps={{
                onFocus: () => onFocus(),
                onBlur: () => onBlur(),
              }}
              label="Description"
              multiline
              minRows={8}
              name="description"
              onChange={handleInfoChange}
              value={props.info?.description}
            />
          </Stack>
        </Box>
      </Stack>
    </Root>
  );
};

export default ProjectInfo;
