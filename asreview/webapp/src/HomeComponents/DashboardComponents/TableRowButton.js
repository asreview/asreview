import * as React from "react";
import { IconButton, Menu, MenuItem, Stack, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Assignment,
  Assessment,
  Download,
  GroupAdd,
  MoreVert,
  PersonOff
} from "@mui/icons-material";
import { projectStatuses } from "../../globals.js";


const PREFIX = "TableRowButton";

const classes = {
  button: `${PREFIX}-button`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.button}`]: {
    color: theme.palette.text.secondary,
    padding: 0,
    [`:hover`]: {
      backgroundColor: "transparent",
      color: theme.palette.text.primary,
    },
  },
}));

export default function TableRowButton(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const onRowMenu = Boolean(anchorEl);

  const handleClickRowMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseRowMenu = () => {
    setAnchorEl(null);
  };

  const handleClickEditDetails = () => {
    handleCloseRowMenu();
    props.onClickProjectDetails();
  };

  const handleClickUpdateStatus = () => {
    handleCloseRowMenu();
    props.updateProjectStatus();
  };

  const handleClickDelete = () => {
    handleCloseRowMenu();
    props.toggleDeleteDialog();
  };

  return (
    <Root>
      <Stack direction="row" spacing={2}>
        {props.showAnalyticsButton() && (
          <Tooltip title="Analytics">
            <IconButton
              className={classes.button}
              onClick={props.onClickProjectAnalytics}
            >
              <Assessment />
            </IconButton>
          </Tooltip>
        )}
        {!props.isSimulating() && props.showReviewButton() && (
          <Tooltip title="Review">
            <IconButton
              className={classes.button}
              onClick={props.onClickProjectReview}
            >
              <Assignment />
            </IconButton>
          </Tooltip>
        )}
        { props.isOwner && (
          <Tooltip title="Add team members">
            <IconButton
              className={classes.button}
              onClick={props.onClickCollaboration}
            >
              <GroupAdd />
            </IconButton>
          </Tooltip>
        )}
        { !props.isOwner && (
          <Tooltip title="Remove yourself from team">
            <IconButton
              className={classes.button}
              onClick={props.onClickCollaboration}
            >
              <PersonOff />
            </IconButton>
          </Tooltip>
        )}
        {!props.isSimulating() && (
          <Tooltip title="Export">
            <IconButton
              className={classes.button}
              onClick={props.onClickProjectExport}
            >
              <Download />
            </IconButton>
          </Tooltip>
        )}
        <div>
          <Tooltip title="Options">
            <IconButton className={classes.button} onClick={handleClickRowMenu}>
              <MoreVert />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={onRowMenu}
            onClose={handleCloseRowMenu}
          >
            {!props.isSimulating() && ( // && props.canEdit
              <MenuItem onClick={handleClickEditDetails}>Edit details</MenuItem>
            )}
            {!props.disableProjectStatusChange() && (
              <MenuItem onClick={handleClickUpdateStatus}>
                {props.projectStatus === projectStatuses.REVIEW
                  ? "Mark as finished"
                  : "Mark as in review"}
              </MenuItem>
            )}
            <MenuItem onClick={handleClickDelete}>Delete {props.isOwner ? "forever" : ""}</MenuItem>
          </Menu>
        </div>
      </Stack>
    </Root>
  );
}
