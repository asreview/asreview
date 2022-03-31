import React from "react";
import { Button, Snackbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  decisionUndoBarDuration,
  decisionUndoBarMarginBottom,
} from "../../globals.js";

const PREFIX = "DecisionUndoBar";

const classes = {
  snackbar: `${PREFIX}-snackbar`,
};

const Root = styled("div")(({ theme }) => ({
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
              disabled={props.disableButton()}
              size="small"
              onClick={handleUndo}
              sx={{
                color: (theme) =>
                  theme.palette.mode === "light"
                    ? "primary.light"
                    : "primary.dark",
              }}
            >
              UNDO
            </Button>
          </div>
        }
        className={classes.snackbar}
      />
    </Root>
  );
};

export default DecisionUndoBar;
