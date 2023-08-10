import { Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const ConfirmationDialog = (props) => {
  return (
    <Dialog
      open={props.open}
      onClose={props.handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {props.contents}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleCancel}>Cancel</Button>
        <Button onClick={props.handleConfirm} autoFocus>
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
