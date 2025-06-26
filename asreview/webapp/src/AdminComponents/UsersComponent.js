import React from "react";
import { useMutation, useQuery } from "react-query";

import {
  Box,
  Grid2 as Grid,
  Stack,
  Typography,
  IconButton,
  Popover,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import {
  AdminPanelSettingsOutlined,
  PersonOutlined,
  Add,
} from "@mui/icons-material";

import { AdminAPI } from "api";
import { InlineErrorHandler } from "Components";
import { UserFormDialog } from "AdminComponents";
import UserCard from "./UserCard";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";

const UsersComponent = () => {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [anchorElInfo, setAnchorElInfo] = React.useState(null);
  const [userFormDialogOpen, setUserFormDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState("create"); // "create" or "edit"
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState(null);

  // Fetch users from the API
  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(["fetchUsers"], AdminAPI.fetchUsers, {
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Process the users data into categories
  const processUsersData = React.useMemo(() => {
    if (!usersData?.users) {
      return [];
    }

    const sortByName = (users) =>
      users.sort((a, b) => a.name.localeCompare(b.name));

    const allUsers = sortByName([...usersData.users]);
    const adminUsers = sortByName(
      usersData.users.filter((user) => user.role === "admin"),
    );
    const memberUsers = sortByName(
      usersData.users.filter((user) => user.role === "member"),
    );

    return [
      {
        group_id: "all_users",
        description: "All Users",
        users: allUsers,
      },
      {
        group_id: "admins",
        description: "Administrators",
        users: adminUsers,
      },
      {
        group_id: "members",
        description: "Members",
        users: memberUsers,
      },
    ];
  }, [usersData]);

  // Mutation for creating new users
  const { mutate: createUser, isLoading: isCreatingUser } = useMutation(
    AdminAPI.createUser,
    {
      onSuccess: () => {
        refetch(); // Refresh the user list
        setUserFormDialogOpen(false);
        setSelectedUser(null);
      },
      onError: (error) => {
        console.error("Failed to create user:", error);
        // You could add a toast notification here
      },
    },
  );

  // Mutation for updating users
  const { mutate: updateUser, isLoading: isUpdatingUser } = useMutation(
    ({ userId, userData }) => AdminAPI.updateUser(userId, userData),
    {
      onSuccess: () => {
        refetch(); // Refresh the user list
        setUserFormDialogOpen(false);
        setSelectedUser(null);
      },
      onError: (error) => {
        console.error("Failed to update user:", error);
        // You could add a toast notification here
      },
    },
  );

  // Mutation for deleting users
  const { mutate: deleteUser, isLoading: isDeletingUser } = useMutation(
    (userId) => AdminAPI.deleteUser(userId),
    {
      onSuccess: () => {
        refetch(); // Refresh the user list
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      },
      onError: (error) => {
        console.error("Failed to delete user:", error);
        // You could add a toast notification here
      },
    },
  );

  const handleHelpPopoverOpen = (event) => {
    setAnchorElInfo(event.currentTarget);
  };

  const handleHelpPopoverClose = () => {
    setAnchorElInfo(null);
  };

  const handleTabChange = (event, newValue) => {
    // If the user clicked the "+" tab (only available when OAuth is disabled), open the create dialog
    if (!window.oAuthData && newValue === userGroups.length) {
      setDialogMode("create");
      setSelectedUser(null);
      setUserFormDialogOpen(true);
    } else {
      setSelectedTab(newValue);
    }
  };

  const handleFormSubmit = (userData) => {
    if (dialogMode === "create") {
      createUser(userData);
    } else if (dialogMode === "edit" && selectedUser) {
      updateUser({ userId: selectedUser.id, userData });
    }
  };

  const handleCloseUserFormDialog = () => {
    setUserFormDialogOpen(false);
    setSelectedUser(null);
    setDialogMode("create");
  };

  const handleEditUser = (user) => {
    setDialogMode("edit");
    setSelectedUser(user);
    setUserFormDialogOpen(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const openInfo = Boolean(anchorElInfo);
  const userGroups = processUsersData;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" fontFamily="Roboto Serif">
          User Management
        </Typography>
        <IconButton size="small" onClick={handleHelpPopoverOpen}>
          <StyledLightBulb fontSize="small" />
        </IconButton>
        <Popover
          open={openInfo}
          anchorEl={anchorElInfo}
          onClose={handleHelpPopoverClose}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                maxWidth: 375,
              },
            },
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Stack spacing={2.5} alignItems="flex-start">
              <Typography variant="subtitle1" fontWeight="bold">
                User Management
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "justify" }}>
                Manage user accounts, roles, and permissions across the ASReview
                system. View all users, edit their details, and control access
                levels.
              </Typography>
              <Alert severity="info">
                <Typography variant="body2">
                  Only administrators can edit user accounts and change roles.
                  {window.oAuthData
                    ? " User creation is handled through OAuth authentication."
                    : " Use the + button to manually create new users."}
                </Typography>
              </Alert>
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 2 }}
                >
                  User Roles
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AdminPanelSettingsOutlined
                      sx={{ color: "error.main", fontSize: 20 }}
                    />
                    <Typography variant="body2">
                      <strong>Admin:</strong> Can add, edit and delete user
                      accounts
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonOutlined
                      sx={{ color: "primary.main", fontSize: 20 }}
                    />
                    <Typography variant="body2">
                      <strong>Member:</strong> Standard user access
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Popover>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading users...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Error State */}
      {isError && (
        <Box sx={{ mb: 3 }}>
          <InlineErrorHandler
            message={error?.message || "Failed to load users"}
            button
            refetch={refetch}
          />
        </Box>
      )}

      {/* Main Content - only show when not loading and no error */}
      {!isLoading && !isError && (
        <>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              {userGroups.map((group, index) => (
                <Tab
                  key={group.group_id}
                  label={`${group.description} (${group.users.length})`}
                  id={`users-tab-${index}`}
                />
              ))}
              {!window.oAuthData && (
                <Tab
                  key="add-user-button-tab"
                  icon={<Add fontSize="small" />}
                  sx={{ p: 1, minWidth: "auto" }}
                  value={userGroups.length}
                  aria-label="Add new user"
                />
              )}
            </Tabs>
          </Box>

          <Box sx={{ pt: 3 }}>
            {userGroups.map((group, index) => (
              <Box
                key={group.group_id}
                role="tabpanel"
                hidden={selectedTab !== index}
                id={`users-tabpanel-${index}`}
              >
                {selectedTab === index && (
                  <Grid container spacing={2} columns={6}>
                    {group.users.map((user) => (
                      <Grid size={{ xs: 6, sm: 3, md: 2 }} key={user.id}>
                        <UserCard
                          user={user}
                          onEdit={handleEditUser}
                          onDelete={handleDeleteUser}
                          isAdmin={true} // TODO: Get from actual auth context
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            ))}
          </Box>

          {userGroups.length === 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
                textAlign: "center",
              }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No users found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Users will appear here once they are registered in the system.
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* User Form Dialog */}
      <UserFormDialog
        open={userFormDialogOpen}
        onClose={handleCloseUserFormDialog}
        onSubmit={handleFormSubmit}
        isSubmitting={dialogMode === "create" ? isCreatingUser : isUpdatingUser}
        user={selectedUser}
        mode={dialogMode}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        user={userToDelete}
        isDeleting={isDeletingUser}
      />
    </Box>
  );
};

export default UsersComponent;
