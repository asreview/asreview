import * as React from "react";
import Confetti from "react-confetti";
import { useQueryClient } from "react-query";
import { connect } from "react-redux";
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
import "../App.css";

const mapStateToProps = (state) => {
  return {
    app_state: state.app_state,
  };
};

const Root = styled("div")(({ theme }) => ({}));

const ProjectInfoForm = (props) => {
  const queryClient = useQueryClient();
  const isProjectSetup = () => {
    return props.app_state === "home";
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
      props.setDisableButton(false);
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
            <Typography variant="h6">Basic information</Typography>
          )}
          {!isProjectSetup() && (
            <TypographySubtitle1Medium>
              Basic information
            </TypographySubtitle1Medium>
          )}
        </Box>
        {props.isFetchingInfo && (
          <Box className="main-page-body-wrapper">
            <CircularProgress />
          </Box>
        )}
        {!props.isFetchingInfo && !props.isFetchInfoError && (
          <Box component="form" noValidate autoComplete="off">
            <Stack direction="column" spacing={3}>
              <MouseOverPopover
                title={
                  !isProjectSetup()
                    ? "Select mode when creating a new project"
                    : "Select mode before proceeding to the next step"
                }
              >
                <ProjectModeSelect
                  disableModeSelect={
                    !isProjectSetup() ? true : props.disableModeSelect
                  }
                  mode={props.info?.mode}
                  handleMode={handleInfoChange}
                  showSimulate={props.showSimulate}
                  onBlur={onBlur}
                  onFocus={onFocus}
                />
              </MouseOverPopover>
              {props.showSimulate && (
                <Box>
                  <Typography color="error">
                    You unlocked the experimental simulation mode!
                  </Typography>
                  <Confetti
                    recycle={false}
                    tweenDuration={50000}
                    numberOfPieces={1000}
                  />
                </Box>
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
            </Stack>
          </Box>
        )}
        {props.isFetchInfoError && (
          <InlineErrorHandler
            message={props.fetchInfoError?.message}
            refetch={refetchInfo}
            button
          />
        )}
      </Stack>
    </Root>
  );
};

export default connect(mapStateToProps)(ProjectInfoForm);
