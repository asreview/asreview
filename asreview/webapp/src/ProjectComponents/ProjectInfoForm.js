import * as React from "react";
import { useQueryClient } from "react-query";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from "../Components";
import { ProjectModeSelect } from "../ProjectComponents";
import { MouseOverPopover } from "../StyledComponents/StyledPopover.js";
import { TypographySubtitle1Medium } from "../StyledComponents/StyledTypography.js";
import { mapStateToProps } from "../globals.js";
import { TagEditor } from "./TagComponents";

const Root = styled("div")(({ theme }) => ({}));

const ProjectInfoForm = (props) => {
  const { project_id } = useParams();
  const queryClient = useQueryClient();

  const fetchInfoState = queryClient.getQueryState([
    "fetchInfo",
    { project_id: props.project_id },
  ]);

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

  const refetchInfo = () => {
    queryClient.resetQueries("fetchInfo");
  };

  return (
    <Root
      style={{
        width: !props.mobileScreen && !isProjectSetup() ? "60%" : "100%",
      }}
    >
      <Stack spacing={3}>
        <Box>
          {isProjectSetup() && (
            <Typography variant="h6">Project information</Typography>
          )}
          {!isProjectSetup() && (
            <TypographySubtitle1Medium>
              Project information
            </TypographySubtitle1Medium>
          )}
        </Box>
        {isProjectSetup() && fetchInfoState?.isFetching && (
          <Box className="main-page-body-wrapper">
            <CircularProgress />
          </Box>
        )}
        {((isProjectSetup() &&
          fetchInfoState.status !== "error" &&
          !fetchInfoState.isFetching) ||
          !isProjectSetup()) && (
          <Box component="form" noValidate autoComplete="off">
            <Stack direction="column" spacing={3}>
              {!isProjectSetup() && (
                <MouseOverPopover title="Select mode when creating a new project">
                  <ProjectModeSelect
                    disableModeSelect
                    mode={props.info?.mode}
                    handleMode={handleInfoChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                  />
                </MouseOverPopover>
              )}
              {isProjectSetup() && (
                <ProjectModeSelect
                  datasetAdded={props.datasetAdded}
                  mode={props.info?.mode}
                  handleMode={handleInfoChange}
                  onBlur={onBlur}
                  onFocus={onFocus}
                />
              )}
              <TextField
                autoFocus
                error={props.isMutateInfoError}
                fullWidth
                helperText={props.mutateInfoError?.message}
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
              <TagEditor tags={props.info.tags} />
            </Stack>
          </Box>
        )}
        {isProjectSetup() && fetchInfoState.status === "error" && (
          <InlineErrorHandler
            message={fetchInfoState.error?.message}
            refetch={refetchInfo}
            button
          />
        )}
        {props.isDeleteProjectError && (
          <InlineErrorHandler message={props.deleteProjectError?.message} />
        )}
      </Stack>
    </Root>
  );
};

export default connect(mapStateToProps)(ProjectInfoForm);
