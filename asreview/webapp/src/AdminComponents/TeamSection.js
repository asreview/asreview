import React from "react";
import { useMutation, useQueryClient } from "react-query";
import {
  Box,
  Stack,
  List,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { PersonOutlined } from "@mui/icons-material";
import { TeamAPI } from "api";
import UserListItem from "./UserListItem";

// Memoized user list component
const UserList = React.memo(
  ({
    users,
    emptyMessage,
    showDeleteButton = false,
    onDelete,
    isDeleting = false,
    onUserClick,
  }) => {
    if (users.length === 0) {
      return (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ fontStyle: "italic", mt: 1, ml: 2 }}
        >
          {emptyMessage}
        </Typography>
      );
    }

    return (
      <List sx={{ pt: 1, pb: 0 }}>
        {users.map((user) => (
          <UserListItem
            key={user.id}
            user={user}
            showDeleteButton={showDeleteButton}
            onDelete={onDelete}
            disableDelete={isDeleting}
            onUserClick={onUserClick}
          />
        ))}
      </List>
    );
  },
);

UserList.displayName = "UserList";

// Memoized section stripe component
const SectionStripe = React.memo(({ icon: Icon, title, count }) => (
  <Box
    sx={{
      px: 2,
      py: 1,
      borderRadius: 1,
      display: "flex",
      alignItems: "center",
      gap: 1,
    }}
  >
    <Icon fontSize="medium" />
    <Typography variant="subtitle3" fontWeight="medium">
      {title} ({count})
    </Typography>
  </Box>
));

SectionStripe.displayName = "SectionStripe";

const TeamSection = ({
  collaborators,
  isLoading,
  isError,
  errorMessage,
  projectId,
  onUserClick,
}) => {
  const queryClient = useQueryClient();
  const [deleteConfirmDialog, setDeleteConfirmDialog] = React.useState({
    open: false,
    user: null,
  });

  // Delete member mutation
  const deleteMemberMutation = useMutation(
    ({ projectId, userId }) =>
      TeamAPI.deleteCollaboration({ projectId, userId }),
    {
      onSuccess: (data) => {
        // Refresh project users data
        queryClient.invalidateQueries(["fetchProjectUsers", projectId]);
        queryClient.invalidateQueries(["fetchAdminProjects"]);
        setDeleteConfirmDialog({ open: false, user: null });
      },
      onError: (error) => {
        console.error("Failed to remove member:", error);
        setDeleteConfirmDialog({ open: false, user: null });
      },
    },
  );

  const handleDeleteUser = (user) => {
    setDeleteConfirmDialog({ open: true, user });
  };

  const handleConfirmDelete = () => {
    const { user } = deleteConfirmDialog;
    if (!user || !projectId) return;

    deleteMemberMutation.mutate({ projectId, userId: user.id });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmDialog({ open: false, user: null });
  };

  const isDeleting = deleteMemberMutation.isLoading;

  // Memoize filtered users to prevent recalculation on each render
  const activeMembers = React.useMemo(() => {
    if (!collaborators) return [];
    return collaborators.filter((user) => user.member && !user.owner);
  }, [collaborators]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="warning" sx={{ mt: 1 }}>
        <Typography variant="body2">
          {errorMessage || "Unable to load project team."}
        </Typography>
      </Alert>
    );
  }

  if (!collaborators) {
    return null;
  }

  return (
    <Stack spacing={2}>
      {/* Active Members Section */}
      <Box>
        <SectionStripe
          icon={PersonOutlined}
          title="Active Members"
          count={activeMembers.length}
        />
        <UserList
          users={activeMembers}
          emptyMessage="No active members"
          showDeleteButton={true}
          onDelete={handleDeleteUser}
          isDeleting={isDeleting}
          onUserClick={onUserClick}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog.open}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Remove Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove{" "}
            <strong>
              {deleteConfirmDialog.user?.name ||
                deleteConfirmDialog.user?.email}
            </strong>{" "}
            from this project?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            This action cannot be undone. The user will lose access to this
            project.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Removing...
              </>
            ) : (
              "Remove Member"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default TeamSection;
