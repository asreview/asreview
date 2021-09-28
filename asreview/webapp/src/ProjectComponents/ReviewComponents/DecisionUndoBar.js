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
  undoButton: `${PREFIX}-undoButton`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },

  [`& .${classes.snackbar}`]: {
    marginBottom: decisionUndoBarMarginBottom,
  },

  [`& .${classes.undoButton}`]: {
    color: theme.palette.secondary.light,
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
    <Snackbar
      anchorOrigin={anchorOrigin}
      open={props.state.open}
      autoHideDuration={decisionUndoBarDuration}
      onClose={handleClose}
      message={props.state.message}
      action={
        <Root>
          <Button
            className={classes.undoButton}
            size="small"
            onClick={handleUndo}
          >
            UNDO
          </Button>
        </Root>
      }
      ContentProps={{
        className: classes.root,
      }}
      className={classes.snackbar}
    />
  );
};

export default DecisionUndoBar;
