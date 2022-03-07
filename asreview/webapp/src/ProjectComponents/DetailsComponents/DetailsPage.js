import * as React from "react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Fade,
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

import { ProjectInfoForm, ProjectDeleteDialog } from "../../ProjectComponents";
import { ActionsFeedbackBar } from "../../Components";
import { DataForm, ModelForm } from "../DetailsComponents";
import { TypographyH5Medium } from "../../StyledComponents/StyledTypography.js";
import { ProjectAPI } from "../../api/index.js";
import { useToggle } from "../../hooks/useToggle";
import "../../App.css";

const Root = styled("div")(({ theme }) => ({}));

const DetailsPage = (props) => {
  const navigate = useNavigate();
  const { project_id } = useParams();
  const queryClient = useQueryClient();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const onOptions = Boolean(anchorEl);

  const [onDeleteDialog, toggleDeleteDialog] = useToggle();
  const [disableButton, setDisableButton] = React.useState(true);
  const [info, setInfo] = React.useState({
    mode: props.info?.mode,
    title: props.info?.name,
    authors: props.info?.authors,
    description: props.info?.description,
  });

  const { error, isError, isLoading, isSuccess, mutate, reset } = useMutation(
    ProjectAPI.mutateInfo,
    {
      onSuccess: (data, variables) => {
        setDisableButton(true);
        if (variables.title !== props.info?.name) {
          // mutate project id when typed title is different from existing title/empty string
          navigate(`/projects/${data["id"]}/details`);
        } else {
          // update cached data
          queryClient.setQueryData(
            ["fetchInfo", { project_id: variables.project_id }],
            (prev) => {
              return {
                ...prev,
                name: variables.title,
                authors: variables.authors,
                description: variables.description,
              };
            }
          );
        }
      },
    }
  );

  const handleClickUndoChanges = () => {
    setInfo({
      ...info,
      title: props.info?.name,
      authors: props.info?.authors,
      description: props.info?.description,
    });
    setDisableButton(true);
  };

  const handleClickSave = () => {
    mutate({
      project_id,
      mode: info.mode,
      title: info.title,
      authors: info.authors,
      description: info.description,
    });
  };

  const handleClickOptions = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseOptions = () => {
    setAnchorEl(null);
  };

  const handleClickDelete = () => {
    handleCloseOptions();
    toggleDeleteDialog();
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
                <TypographyH5Medium>Project details</TypographyH5Medium>
              )}
              {props.mobileScreen && (
                <Typography variant="h6">Project details</Typography>
              )}
              <Stack direction="row" spacing={1}>
                <Button
                  disabled={disableButton}
                  onClick={handleClickUndoChanges}
                  size={!props.mobileScreen ? "medium" : "small"}
                >
                  Undo Changes
                </Button>
                <Tooltip
                  disableFocusListener={!props.isSimulating()}
                  disableHoverListener={!props.isSimulating()}
                  disableTouchListener={!props.isSimulating()}
                  title="Save after simulation is finished"
                >
                  <span>
                    <LoadingButton
                      disabled={disableButton || props.isSimulating()}
                      loading={isLoading}
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
                    <MenuItem onClick={handleClickDelete}>Delete</MenuItem>
                  </Menu>
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* Page body */}
          <Box className="main-page-body-wrapper">
            <Stack
              className="main-page-body"
              direction={!props.mobileScreen ? "row" : "column"}
              spacing={3}
            >
              <ProjectInfoForm
                info={info}
                mobileScreen={props.mobileScreen}
                setInfo={setInfo}
                setDisableButton={setDisableButton}
              />
              <Stack
                spacing={3}
                sx={{ width: !props.mobileScreen ? "40%" : "100%" }}
              >
                <DataForm setHistoryFilterQuery={props.setHistoryFilterQuery} />
                <ModelForm />
              </Stack>
            </Stack>
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
        open={isSuccess}
        onClose={reset}
      />
      {isError && (
        <ActionsFeedbackBar
          feedback={error?.message + " Please try again."}
          open={isError}
          onClose={reset}
        />
      )}
    </Root>
  );
};

export default DetailsPage;
