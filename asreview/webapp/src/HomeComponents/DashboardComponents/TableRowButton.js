import * as React from "react";
import { IconButton, Menu, MenuItem, Stack, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Assignment, Assessment, MoreVert } from "@mui/icons-material";

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

  return (
    <Root>
      <Stack direction="row" spacing={2}>
        {props.showAnalyticsButton() && (
          <Tooltip title="Analytics">
            <IconButton
              className={classes.button}
              onClick={
                props.isConverting ? null : props.onClickProjectAnalytics
              }
            >
              <Assessment />
            </IconButton>
          </Tooltip>
        )}
        {props.showReviewButton() && (
          <Tooltip title="Review">
            <IconButton
              className={classes.button}
              onClick={props.isConverting ? null : props.onClickProjectReview}
            >
              <Assignment />
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
            <MenuItem>Edit details</MenuItem>
            <MenuItem>Delete forever</MenuItem>
          </Menu>
        </div>
      </Stack>
    </Root>
  );
}
