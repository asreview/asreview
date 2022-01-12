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
import { DataForm, DetailsForm, ModelForm } from "../DetailsComponents";
import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps, mapDispatchToProps } from "../../globals.js";
import { useToggle } from "../../hooks/useToggle";
import "../../App.css";

const PREFIX = "DetailsPage";

const classes = {
  dataModelForm: `${PREFIX}-data-model-form`,
  pageTitle: `${PREFIX}-page-title`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.dataModelForm}`]: {
    width: "40%",
  },

  [`& .${classes.pageTitle}`]: {
    justifyContent: "space-between",
  },
}));

const DetailsPage = (props) => {
  const queryClient = useQueryClient();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const onOptions = Boolean(anchorEl);

  const [onDeleteDialog, toggleDeleteDialog] = useToggle();
  const [onFeedbackBar, toggleFeedbackBar] = useToggle();
  const [disableButton, setDisableButton] = React.useState(true);
  const [details, setDetails] = React.useState({
    mode: props.details?.mode,
    title: props.details?.name,
    authors: props.details?.authors,
    description: props.details?.description,
  });

  const { error, isError, isLoading, mutate } = useMutation(
    ProjectAPI.mutateInfo,
    {
      onSettled: (data, error, variables) => {
        if (error || variables.title === props.details?.name) {
          // avoid bar if project title/id changes
          toggleFeedbackBar();
        }
      },
      onSuccess: (data, variables) => {
        setDisableButton(true);
        if (variables.title !== props.details?.name) {
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
    setDetails({
      ...details,
      title: props.details?.name,
      authors: props.details?.authors,
      description: props.details?.description,
    });
    setDisableButton(true);
  };

  const handleClickSave = () => {
    mutate({
      project_id: props.project_id,
      mode: details.mode,
      title: details.title,
      authors: details.authors,
      description: details.description,
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
    <Root className="main-page-container" aria-label="details page">
      <Fade in>
        <Stack spacing={3}>
          <Stack className={classes.pageTitle} direction="row">
            <Typography variant="h6">Project details</Typography>
            <Stack direction="row" spacing={1}>
              <Button disabled={disableButton} onClick={handleClickUndoChanges}>
                Undo Changes
              </Button>
              <LoadingButton
                disabled={disableButton}
                loading={isLoading}
                variant="contained"
                onClick={handleClickSave}
              >
                Save
              </LoadingButton>
              <Box>
                <Tooltip title="Options">
                  <IconButton onClick={handleClickOptions}>
                    <MoreVert />
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
          </Stack>
          <Stack className="main-page-body" direction="row" spacing={3}>
            <DetailsForm
              details={details}
              setDetails={setDetails}
              setDisableButton={setDisableButton}
            />
            <Stack className={classes.dataModelForm} spacing={3}>
              <DataForm />
              <ModelForm />
            </Stack>
          </Stack>
        </Stack>
      </Fade>
      <ProjectDeleteDialog
        onDeleteDialog={onDeleteDialog}
        toggleDeleteDialog={toggleDeleteDialog}
        projectTitle={props.details?.name}
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
