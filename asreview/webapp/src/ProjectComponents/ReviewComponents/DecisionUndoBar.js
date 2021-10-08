import React from "react";
import { Button, Snackbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  decisionUndoBarDuration,
  decisionUndoBarMarginBottom,
} from "../../globals.js";

const PREFIX = "DecisionUndoBar";

const classes = {
  root: `${PREFIX}-root`,
  snackbar: `${PREFIX}-snackbar`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },

  [`& .${classes.snackbar}`]: {
    marginBottom: decisionUndoBarMarginBottom,
    [theme.breakpoints.down("md")]: {
      marginBottom: 70,
    },
  },
}));

const DecisionUndoBar = (props) => {
  const handleClose = (event, reason) => {
    props.close();
  };

  const handleUndo = (event, reason) => {
    props.undo();
  };

  let anchorOrigin = {
    vertical: "bottom",
    horizontal: "right",
  };

  return (
    <Root>
      <Snackbar
        anchorOrigin={anchorOrigin}
        open={props.state.open}
        autoHideDuration={decisionUndoBarDuration}
        onClose={handleClose}
        message={props.state.message}
        action={
          <div>
            <Button
              className={classes.undoButton}
              size="small"
              onClick={handleUndo}
            >
              UNDO
            </Button>
          </div>
        }
        ContentProps={{
          className: classes.root,
        }}
        className={classes.snackbar}
      />
    </Root>
  );
};

export default DecisionUndoBar;
