import * as React from "react";
import { useMutation, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Fade,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { MoreVert } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";

import { ProjectInfo, ProjectDeleteDialog } from "../../ProjectComponents";
import { ActionsFeedbackBar } from "../../Components";
import { DataForm, ModelForm } from "../DetailsComponents";
import { TypographyH5Medium } from "../../StyledComponents/StyledTypography.js";
import { ProjectAPI } from "../../api/index.js";
import { projectModes, projectStatuses } from "../../globals.js";
import { useToggle } from "../../hooks/useToggle";
import { TagEditor } from "../TagComponents";

const Root = styled("div")(({ theme }) => ({}));

const DetailsPage = (props) => {
  const { project_id } = useParams();
  const queryClient = useQueryClient();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const onOptions = Boolean(anchorEl);

  const [onDeleteDialog, toggleDeleteDialog] = useToggle();
  const [disableSaveButton, setDisableSaveButton] = React.useState(true);
  const [disableUndoButton, setDisableUndoButton] = React.useState(true);
  const [info, setInfo] = React.useState({
    mode: props.info?.mode,
    title: props.info?.name,
    authors: props.info?.authors,
    description: props.info?.description,
    tags: props.tags,
  });

  const {
    error: mutateInfoError,
    isError: isMutateInfoError,
    isLoading: isMutatingInfo,
    isSuccess: isMutateInfoSuccess,
    mutate: mutateInfo,
    reset: resetMutateInfo,
  } = useMutation(ProjectAPI.mutateInfo, {
    onSuccess: (data, variables) => {
      setDisableSaveButton(true);
      setDisableUndoButton(true);
      // update cached data
      queryClient.setQueryData(
        ["fetchInfo", { project_id: variables.project_id }],
        (prev) => {
          return {
            ...prev,
            name: variables.title,
            authors: variables.authors,
            description: variables.description,
            tags: variables.tags,
          };
        },
      );
    },
  });

  const {
    error: mutateStatusError,
    isError: isMutateStatusError,
    mutate: mutateStatus,
    reset: resetMutateStatus,
  } = useMutation(ProjectAPI.mutateProjectStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries("fetchInfo");
    },
  });

  const handleClickUndoChanges = () => {
    setInfo({
      ...info,
      title: props.info?.name,
      authors: props.info?.authors,
      description: props.info?.description,
      tags: props.tags,
    });
    setDisableSaveButton(true);
    setDisableUndoButton(true);
  };

  const handleClickSave = () => {
    mutateInfo({
      project_id,
      mode: info.mode,
      title: info.title,
      authors: info.authors,
      description: info.description,
      tags: info.tags,
    });
  };

  const handleClickOptions = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseOptions = () => {
    setAnchorEl(null);
  };

  const handleChangeStatus = () => {
    handleCloseOptions();
    mutateStatus({
      project_id,
      status:
        props.info?.reviews[0].status === projectStatuses.REVIEW
          ? projectStatuses.FINISHED
          : projectStatuses.REVIEW,
    });
  };

  const handleClickDelete = () => {
    handleCloseOptions();
    toggleDeleteDialog();
  };

  const isTitleValidated = () => {
    return info.title.length > 0;
  };

  return (
    <Root aria-label="details page">
      <Fade in>
        <Box>
          {/* Page title */}
          <Box
            className="main-page-sticky-header-wrapper"
            sx={{ background: (theme) => theme.palette.background.paper }}
          >
            <Box className="main-page-sticky-header with-button">
              {!props.mobileScreen && (
                <TypographyH5Medium>Details</TypographyH5Medium>
              )}
              {props.mobileScreen && (
                <Typography variant="h6">Details</Typography>
              )}
              <Stack direction="row" spacing={1}>
                <Button
                  disabled={disableUndoButton}
                  onClick={handleClickUndoChanges}
                  size={!props.mobileScreen ? "medium" : "small"}
                >
                  Undo Changes
                </Button>
                <Tooltip
                  disableFocusListener={!props.isSimulating}
                  disableHoverListener={!props.isSimulating}
                  disableTouchListener={!props.isSimulating}
                  title="Save after simulation is finished"
                >
                  <span>
                    <LoadingButton
                      disabled={disableSaveButton || props.isSimulating}
                      loading={isMutatingInfo}
                      variant="contained"
                      onClick={handleClickSave}
                      size={!props.mobileScreen ? "medium" : "small"}
                    >
                      Save
                    </LoadingButton>
                  </span>
                </Tooltip>
                <Box>
                  <Tooltip title="Options">
                    <IconButton
                      onClick={handleClickOptions}
                      size={!props.mobileScreen ? "medium" : "small"}
                    >
                      <MoreVert
                        fontSize={!props.mobileScreen ? "medium" : "small"}
                      />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={onOptions}
                    onClose={handleCloseOptions}
                  >
                    {info.mode !== projectModes.SIMULATION && (
                      <MenuItem onClick={handleChangeStatus}>
                        {props.info?.reviews[0].status ===
                        projectStatuses.REVIEW
                          ? "Mark as finished"
                          : "Mark as in review"}
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleClickDelete}>Delete</MenuItem>
                  </Menu>
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* Page body */}
          <Box className="main-page-body-wrapper">
            <Grid className="main-page-body" container spacing={3}>
              <Grid item xs={12} sm={8}>
                <ProjectInfo
                  info={info}
                  isTitleValidated={isTitleValidated()}
                  mobileScreen={props.mobileScreen}
                  setInfo={setInfo}
                  setDisableSaveButton={setDisableSaveButton}
                  setDisableUndoButton={setDisableUndoButton}
                />
                <TagEditor
                  project_id={project_id}
                  // mobileScreen={props.mobileScreen}
                  // onFocus={onFocus}
                  // onBlur={onBlur}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack spacing={3}>
                  <DataForm
                    setHistoryFilterQuery={props.setHistoryFilterQuery}
                  />
                  <ModelForm />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Fade>
      <ProjectDeleteDialog
        onDeleteDialog={onDeleteDialog}
        toggleDeleteDialog={toggleDeleteDialog}
        projectTitle={props.info?.name}
        project_id={project_id}
      />
      <ActionsFeedbackBar
        feedback="Changes saved"
        open={isMutateInfoSuccess}
        onClose={resetMutateInfo}
      />
      {isMutateInfoError && (
        <ActionsFeedbackBar
          feedback={mutateInfoError?.message + " Please try again."}
          open={isMutateInfoError}
          onClose={resetMutateInfo}
        />
      )}
      {isMutateStatusError && (
        <ActionsFeedbackBar
          feedback={mutateStatusError?.message + " Please try again."}
          open={isMutateStatusError}
          onClose={resetMutateStatus}
        />
      )}
    </Root>
  );
};

export default DetailsPage;
