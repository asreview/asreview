import * as React from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import clsx from "clsx";
import { Box, Stack, TextField, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ProjectAPI } from "../api";
import { CardErrorHandler } from "../Components";

import { TypographySubtitle1Medium } from "../StyledComponents/StyledTypography.js";

const PREFIX = "ProjectInfo";

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

const ProjectInfo = ({ handleComplete, editable = true }) => {
  const { project_id } = useParams();

  const [textFiledFocused, setTextFieldFocused] = React.useState(null); // for autosave on blur
  const [info, setInfo] = React.useState(null);

  const isProjectSetup = () => {
    return !project_id;
  };

  const onFocus = () => {
    if (!isProjectSetup()) {
      // do nothing
    } else {
      setTextFieldFocused(true);
    }
  };

  const onBlur = () => {
    if (!isProjectSetup()) {
      // do nothing
    } else {
      setTextFieldFocused(false);
    }
  };

  const handleInfoChange = (event) => {
    if (!isProjectSetup()) {
      setInfo({
        ...info,
        [event.target.name]: event.target.value,
      });
      // if (event.target.name === "title" && !event.target.value) {
      //   setDisableSaveButton(true);
      // } else if (info?.title) {
      //   setDisableSaveButton(false);
      // } else {
      //   // do nothing
      // }
      // setDisableUndoButton(false);
    } else {
      handleInfoChange(event);
    }
  };

  /**
   * Fetch project info
   */
  const { error: fetchInfoError, isError: isFetchInfoError } = useQuery(
    ["fetchInfo", { project_id: project_id }],
    ProjectAPI.fetchInfo,
    {
      enabled: project_id !== null,
      onSuccess: (data) => {
        setInfo({
          title: data["name"],
          authors: data["authors"] ? data["authors"] : "",
          description: data["description"] ? data["description"] : "",
          dataset_path: data.dataset_path,
        });
      },
      refetchOnWindowFocus: false,
    },
  );

  /**
   * Mutate project info
   */
  const {
    error: mutateInfoError,
    isError: isMutateInfoError,
    // {TODO} isLoading: isMutatingInfo,
    mutate,
    reset,
  } = useMutation(ProjectAPI.mutateInfo, {
    mutationKey: ["mutateInfo"],
    onError: () => {
      handleComplete(false);
    },
    onSuccess: () => {
      setTextFieldFocused(null);
      handleComplete(true);
    },
  });

  // const handleInfoChange = (event) => {
  //   setInfo({
  //     ...info,
  //     [event.target.name]: event.target.value,
  //   });
  // };

  const isValidTtitle = () => {
    return info?.title.length > 0;
  };

  // auto mutate info when text field is not focused
  React.useEffect(() => {
    if (
      project_id !== null &&
      textFiledFocused !== null &&
      !textFiledFocused &&
      !(info.title.length < 1) &&
      !isMutateInfoError
    ) {
      mutate({
        project_id: project_id,
        title: info.title,
        authors: info.authors,
        description: info.description,
      });
    }
  }, [info, isMutateInfoError, mutate, project_id, textFiledFocused]);

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
              open={!isValidTtitle}
              placement="top-start"
            >
              <TextField
                autoFocus
                error={!isValidTtitle}
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
                value={info?.title}
                disabled={!editable}
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
              value={info?.authors}
              disabled={!editable}
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
              value={info?.description}
              disabled={!editable}
            />
          </Stack>
        </Box>

        <CardErrorHandler
          queryKey={"fetchInfo"}
          error={fetchInfoError}
          isError={isFetchInfoError}
        />
      </Stack>
    </Root>
  );
};

export default ProjectInfo;
