import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@material-ui/core";

export default function ExitDialog(props) {
  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (props.exit) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.exit]);

  return (
    <Dialog
      open={props.exit}
      onClose={props.toggleExit}
      scroll="paper"
      fullWidth={true}
      maxWidth={"sm"}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
    >
      <DialogTitle id="scroll-dialog-title">Exit ASReview</DialogTitle>
      <DialogContent dividers={true}>
        {(window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1") && (
          <div>
            <Typography>Close your browser window. </Typography>
            <br />
            <Typography>
              For a complete shutdown, please close your terminal or CMD.exe as
              well (CTRL+C). Your work is automatically saved.
            </Typography>
          </div>
        )}
        {window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1" &&
          (
            <Typography>
              Just close the window. Your work is automatically saved.{" "}
            </Typography>
          ) &
            (
              <div>
                <Typography>Close your browser window. </Typography>
                <br />
                <Typography>
                  For a complete shutdown, please close your terminal or CMD.exe
                  as well (CTRL+C). Your work is automatically saved.
                </Typography>
              </div>
            )}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.toggleExit}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
