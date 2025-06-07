import React from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";

const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  user,
  isDeleting,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete User Account</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body1">
            Are you sure you want to delete the user account for:
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              {user?.name || "No Name"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Role: {user?.role} • Origin: {user?.origin}
            </Typography>
          </Box>
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>This action cannot be undone.</strong> All data associated
              with this user account will be permanently deleted.
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
