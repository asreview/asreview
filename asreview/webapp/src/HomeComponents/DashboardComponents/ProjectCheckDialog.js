import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Link,
  List,
  ListItem,
  ListItemText,
  Stack,
} from "@mui/material";

import { InlineErrorHandler } from "Components";
import { ProjectAPI } from "api";

const ProjectCheckDialog = (props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [upgrade, setUpgrade] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  /**
   * Upgrade old project
   */
  const {
    error: upgradeProjectError,
    isError: isUpgradeProjectError,
    isFetching: isUpgradingProject,
  } = useQuery(
    [
      "fetchUpgradeProjectIfOld",
      { project_id: props.projectCheck?.project_id },
    ],
    ProjectAPI.fetchUpgradeProjectIfOld,
    {
      enabled: upgrade,
      retry: false,
      onSuccess: () => {
        navigate(
          `/projects/${props.projectCheck?.project_id}/${props.projectCheck?.path}`,
        );
        queryClient.invalidateQueries("fetchProjectIsOld", {
          refetchActive: false,
        });
        props.setProjectCheck({
          open: false,
          issue: null,
          path: "/projects",
          project_id: null,
        });
      },
      onSettled: () => {
        setUpgrade(false);
      },
      refetchOnWindowFocus: false,
    },
  );

  /**
   * Export project
   */
  const {
    error: exportProjectError,
    isError: isExportProjectError,
    isFetching: isExportingProject,
  } = useQuery(
    ["fetchExportProject", { project_id: props.projectCheck?.project_id }],
    ProjectAPI.fetchExportProject,
    {
      enabled: exporting,
      refetchOnWindowFocus: false,
      onSettled: () => setExporting(false),
    },
  );

  const returnAction = () => {
    if (props.projectCheck?.issue === "upgrade") {
      setUpgrade(true);
    }
  };

  const returnActionState = () => {
    if (props.projectCheck?.issue === "upgrade") {
      return ["Upgrade", "Upgrading..."];
    } else {
      return [null, null];
    }
  };

  const returnError = () => {
    if (isUpgradeProjectError) {
      return [isUpgradeProjectError, upgradeProjectError];
    } else if (isExportProjectError) {
      return [isExportProjectError, exportProjectError];
    } else {
      return [false, null];
    }
  };

  const returnIsFetching = () => {
    return isUpgradingProject;
  };

  const disableButton = () => {
    return isUpgradingProject || isExportingProject;
  };

  const handleClose = () => {
    resetQuery();
    props.setProjectCheck({
      ...props.projectCheck,
      open: false,
    });
  };

  const resetQuery = () => {
    if (isUpgradeProjectError) {
      queryClient.resetQueries("fetchUpgradeProjectIfOld");
    }
    if (isExportProjectError) {
      queryClient.resetQueries("fetchExportProject");
    }
  };

  const onClickExport = () => {
    if (!disableButton()) {
      setExporting(true);
    }
  };

  const checkText = [
    {
      label: "upgrade",
      text: (
        <div>
          <DialogContentText>
            You are opening a project created in an earlier version of ASReview
            LAB:
          </DialogContentText>
          <List sx={{ listStyle: "disc outside", pl: "20px" }}>
            <ListItem sx={{ display: "list-item", pt: 0, pb: 0 }}>
              <ListItemText sx={{ color: "text.secondary" }}>
                Upgrade this project and enjoy new features
              </ListItemText>
            </ListItem>
            <ListItem sx={{ display: "list-item", pt: 0, pb: 0 }}>
              <ListItemText sx={{ color: "text.secondary" }}>
                All data and relevant/irrelevant labels are preserved
              </ListItemText>
            </ListItem>
            <ListItem sx={{ display: "list-item", pt: 0, pb: 0 }}>
              <ListItemText sx={{ color: "text.secondary" }}>
                Recommend{" "}
                <Link
                  component="button"
                  onClick={onClickExport}
                  variant="body1"
                >
                  exporting a copy
                </Link>{" "}
                of your project as a backup
              </ListItemText>
            </ListItem>
          </List>
          <DialogContentText>
            Note that after upgrading, your project will no longer work properly
            in earlier versions.
          </DialogContentText>
        </div>
      ),
    },
  ];

  return (
    <Dialog
      open={props.projectCheck?.open}
      onClose={!returnIsFetching() ? handleClose : null}
      TransitionProps={{
        onExited: () => {
          props.setProjectCheck({
            ...props.projectCheck,
            issue: null,
            path: "/projects",
            project_id: null,
          });
        },
      }}
    >
      <DialogContent>
        <Stack spacing={3}>
          {
            checkText.find(
              (element) => element.label === props.projectCheck?.issue,
            )?.text
          }
          {returnError()[0] && (
            <InlineErrorHandler
              message={returnError()[1]?.message + " Please try again."}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ pl: 2, pr: 2 }}>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={handleClose}
            color="primary"
            disabled={disableButton()}
          >
            Cancel
          </Button>
          <Button
            onClick={returnAction}
            color="primary"
            autoFocus
            disabled={disableButton()}
          >
            {!returnIsFetching()
              ? returnActionState()[0]
              : returnActionState()[1]}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectCheckDialog;
