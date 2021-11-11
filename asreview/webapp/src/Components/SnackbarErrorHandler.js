import React from "react";
import { useQueryClient } from "react-query";
import { Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function SnackbarErrorHandler(props) {
  const queryClient = useQueryClient();

  const handleClose = () => {
    queryClient.resetQueries(props.queryKey);
  };

  let anchorOrigin = {
    vertical: "bottom",
    horizontal: "right",
  };

  return (
    <Snackbar
      anchorOrigin={anchorOrigin}
      open={props.open}
      autoHideDuration={6000}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={props.severity}>
        {props.message}
      </Alert>
    </Snackbar>
  );
}
