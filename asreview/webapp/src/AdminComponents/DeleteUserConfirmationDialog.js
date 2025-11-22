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

const DeleteUserConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  user,
  users,
  isDeleting,
  isBatch = false,
}) => {
  const isBatchMode = isBatch && users && users.length > 0;
  const displayUsers = isBatchMode ? users : user ? [user] : [];
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isBatchMode
          ? `Delete ${users.length} User Account${users.length > 1 ? "s" : ""}`
          : "Delete User Account"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body1">
            {isBatchMode
              ? `Are you sure you want to delete ${users.length} user account${users.length > 1 ? "s" : ""}?`
              : "Are you sure you want to delete the user account for:"}
          </Typography>
          <Box
            sx={{
              maxHeight: isBatchMode && users.length > 3 ? 200 : "auto",
              overflowY: isBatchMode && users.length > 3 ? "auto" : "visible",
            }}
          >
            {displayUsers.map((userItem, index) => (
              <Box
                key={userItem?.id || index}
                sx={{
                  p: 2,
                  mb: 1,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {userItem?.name || "No Name"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userItem?.email}
                </Typography>
                {userItem?.affiliation && (
                  <Typography variant="body2" color="text.secondary">
                    {userItem.affiliation}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  Role: {userItem?.role} • Origin: {userItem?.origin}
                </Typography>
              </Box>
            ))}
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
          {isDeleting
            ? isBatchMode
              ? "Deleting Users..."
              : "Deleting..."
            : isBatchMode
              ? `Delete ${users?.length || 0} Users`
              : "Delete User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserConfirmationDialog;
