import * as React from "react";
import { useQueryClient } from "react-query";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";

export default function DialogErrorHandler(props) {
  const queryClient = useQueryClient();
  const resetQuery = () => {
    queryClient.resetQueries(props.queryKey);
  };

  return (
    <Dialog open={props.isError} onClose={resetQuery}>
      <DialogContent>
        <DialogContentText>{props.error?.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetQuery} autoFocus>
          Try to Refresh
        </Button>
      </DialogActions>
    </Dialog>
  );
}
