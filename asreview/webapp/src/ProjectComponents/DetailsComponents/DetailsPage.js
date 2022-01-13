import * as React from "react";
import { useMutation, useQueryClient } from "react-query";
import { connect } from "react-redux";
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

import { ActionsFeedbackBar, ProjectDeleteDialog } from "../../Components";
import { DataForm, InfoForm, ModelForm } from "../DetailsComponents";
import { TypographyH5Medium } from "../../StyledComponents/StyledTypography.js";
import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps, mapDispatchToProps } from "../../globals.js";
import { useToggle } from "../../hooks/useToggle";
import "../../App.css";

const PREFIX = "DetailsPage";

const classes = {
  pageHeaderWrapper: `${PREFIX}-page-header-wrapper`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.pageHeaderWrapper}`]: {
    background: theme.palette.background.paper,
    zIndex: 1000,
  },
}));

const DetailsPage = (props) => {
  const queryClient = useQueryClient();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const onOptions = Boolean(anchorEl);

  const [onDeleteDialog, toggleDeleteDialog] = useToggle();
  const [onFeedbackBar, toggleFeedbackBar] = useToggle();
  const [disableButton, setDisableButton] = React.useState(true);
  const [info, setInfo] = React.useState({
    mode: props.info?.mode,
    title: props.info?.name,
    authors: props.info?.authors,
    description: props.info?.description,
  });

  const { error, isError, isLoading, mutate } = useMutation(
    ProjectAPI.mutateInfo,
    {
      onSettled: (data, error, variables) => {
        if (error || variables.title === props.info?.name) {
          // avoid bar if project title/id changes
          toggleFeedbackBar();
        }
      },
      onSuccess: (data, variables) => {
        setDisableButton(true);
        if (variables.title !== props.info?.name) {
          // mutate project id when typed title is different from existing title/empty string
          props.setProjectId(data["id"]);
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
      project_id: props.project_id,
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
            className={`main-page-sticky-header-wrapper ${classes.pageHeaderWrapper}`}
          >
            <Box className="main-page-sticky-header-with-button">
              {!props.mobileScreen && (
                <TypographyH5Medium text="Project details" />
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
                <LoadingButton
                  disabled={disableButton}
                  loading={isLoading}
                  variant="contained"
                  onClick={handleClickSave}
                  size={!props.mobileScreen ? "medium" : "small"}
                >
                  Save
                </LoadingButton>
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
              <InfoForm
                info={info}
                mobileScreen={props.mobileScreen}
                setInfo={setInfo}
                setDisableButton={setDisableButton}
              />
              <Stack
                spacing={3}
                sx={{ width: !props.mobileScreen ? "40%" : "100%" }}
              >
                <DataForm />
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
        project_id={props.project_id}
      />
      {!isError && !isLoading && (
        <ActionsFeedbackBar
          feedback="Changes saved"
          onClose={toggleFeedbackBar}
          open={onFeedbackBar}
        />
      )}
      {isError && !isLoading && (
        <ActionsFeedbackBar
          feedback={error["message"] + " Please try again."}
          onClose={toggleFeedbackBar}
          open={onFeedbackBar}
        />
      )}
    </Root>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailsPage);
