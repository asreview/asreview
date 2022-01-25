import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Stack,
} from "@mui/material";

import { InlineErrorHandler } from "../../Components";
import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";

const checkText = [
  {
    label: "upgrade",
    text: (
      <DialogContentText>
        You are attempting to open a project that was created in an earlier
        version of ASReview LAB. You can open it after upgrading this project.
        Your data will remain intact. Note that after upgrading, your project
        will <b>no longer</b> work properly in earlier versions.
      </DialogContentText>
    ),
  },
];

const ProjectCheckDialog = (props) => {
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
    ["fetchUpgradeProjectIfOld", { project_id: props.project_id }],
    ProjectAPI.fetchUpgradeProjectIfOld,
    {
      enabled: upgrade,
      onSuccess: () => {
        props.handleAppState("project-page");
        props.handleNavState(props.projectCheck?.destination);
        queryClient.invalidateQueries("fetchProjectIsOld", {
          refetchActive: false,
        });
      },
      onSettled: () => {
        setUpgrade(false);
      },
      refetchOnWindowFocus: false,
    }
  );

  /**
   * Export project
   */
  const {
    error: exportProjectError,
    isError: isExportProjectError,
    isFetching: isExportingProject,
  } = useQuery(
    ["fetchExportProject", { project_id: props.project_id }],
    ProjectAPI.fetchExportProject,
    {
      enabled: exporting,
      refetchOnWindowFocus: false,
      onSettled: () => setExporting(false),
    }
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
    props.handleAppState("home");
  };

  const resetQuery = () => {
    if (isUpgradeProjectError) {
      queryClient.resetQueries("fetchUpgradeProjectIfOld");
    }
    if (isExportProjectError) {
      queryClient.resetQueries("fetchExportProject");
    }
  };

  return (
    <Dialog
      open={props.projectCheck?.open}
      onClose={!returnIsFetching() ? handleClose : null}
      TransitionProps={{
        onExited: () => {
          props.setProjectCheck({
            ...props.projectCheck,
            issue: null,
            destination: "dashboard",
          });
        },
      }}
    >
      <DialogContent>
        <Stack spacing={3}>
          {
            checkText.find(
              (element) => element.label === props.projectCheck?.issue
            )?.text
          }
          {returnError()[0] && (
            <InlineErrorHandler
              message={returnError()[1]?.message + " Please try again."}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", pl: 2, pr: 2 }}>
        <Button disabled={disableButton()} onClick={() => setExporting(true)}>
          {!isExportingProject ? "Export Project" : "Exporting..."}
        </Button>
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

export default connect(mapStateToProps)(ProjectCheckDialog);
