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
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Button,
  Toolbar,
} from "@mui/material";
import {
  AdminPanelSettingsOutlined,
  PersonOutlined,
  Add,
  Search,
  Clear,
  Delete,
  ArrowUpward,
} from "@mui/icons-material";

import { AdminAPI } from "api";
import { InlineErrorHandler } from "Components";
import { UserFormDialog, CSVImportDialog } from "AdminComponents";
import { useAuth } from "hooks/useAuth";
import UserCard from "./UserCard";
import DeleteUserConfirmationDialog from "./DeleteUserConfirmationDialog";
import ProjectDetailsModal from "./ProjectDetailsModal";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";

const UsersComponent = () => {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [anchorElInfo, setAnchorElInfo] = React.useState(null);
  const [userFormDialogOpen, setUserFormDialogOpen] = React.useState(false);
  const [csvImportDialogOpen, setCSVImportDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState("create"); // "create" or "edit"
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState(null);

  // Search state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");

  // Project modal state
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [projectModalOpen, setProjectModalOpen] = React.useState(false);

  // Batch selection state
  const [selectedUsers, setSelectedUsers] = React.useState([]);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] =
    React.useState(false);

  // Get current user for exclusion from selection
  const { user: currentUser } = useAuth();

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

  // Process the users data into categories with filtering
  const processUsersData = React.useMemo(() => {
    if (!usersData?.users) {
      return [];
    }

    const sortByName = (users) =>
      users.sort((a, b) => a.name.localeCompare(b.name));

    // Filter users based on search term (only if search has 3+ characters)
    const filterUsers = (users) => {
      if (debouncedSearchTerm.length < 3) {
        return users;
      }
      return users.filter((user) => {
        const searchableText = [
          user.name,
          user.email,
          user.identifier,
          user.affiliation,
          user.origin,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchableText.includes(debouncedSearchTerm.toLowerCase());
      });
    };

    const filteredUsers = filterUsers(usersData.users);
    const allUsers = sortByName([...filteredUsers]);
    const adminUsers = sortByName(
      filteredUsers.filter((user) => user.role === "admin"),
    );
    const memberUsers = sortByName(
      filteredUsers.filter((user) => user.role === "member"),
    );
    const pendingUsers = sortByName(
      filteredUsers.filter((user) => !user.confirmed),
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
      {
        group_id: "pending",
        description: "Pending",
        users: pendingUsers,
      },
    ];
  }, [usersData, debouncedSearchTerm]);

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  // Mutation for batch deleting users
  const { mutate: batchDeleteUsers, isLoading: isDeletingBatch } = useMutation(
    (userIds) => AdminAPI.batchDeleteUsers(userIds),
    {
      onSuccess: () => {
        refetch(); // Refresh the user list
        setBatchDeleteDialogOpen(false);
        setSelectedUsers([]);
      },
      onError: (error) => {
        console.error("Failed to batch delete users:", error);
        // You could add a toast notification here
      },
    },
  );

  // Mutation for bulk importing users
  const { mutate: bulkImportUsers, isLoading: isImportingUsers } = useMutation(
    (usersData) => AdminAPI.bulkImportUsers(usersData),
    {
      onSuccess: (data) => {
        refetch(); // Refresh the user list
        return data; // Return results to the dialog
      },
      onError: (error) => {
        console.error("Failed to import users:", error);
        throw error; // Propagate error to the dialog
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
    // Action tabs are handled via onClick, so just change to the selected tab
    setSelectedTab(newValue);
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

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setProjectModalOpen(true);
  };

  const handleProjectModalClose = () => {
    setProjectModalOpen(false);
    setSelectedProject(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleUserClickFromProject = (user) => {
    setSelectedUser(user);
    setDialogMode("edit");
    setUserFormDialogOpen(true);
    // Close project modal when opening user modal
    setProjectModalOpen(false);
  };

  // Batch selection handlers
  const handleUserSelect = (userId, isSelected) => {
    setSelectedUsers((prevSelected) => {
      if (isSelected) {
        return [...prevSelected, userId];
      } else {
        return prevSelected.filter((id) => id !== userId);
      }
    });
  };

  const handleSelectAll = (users) => {
    // Filter out current user from selection
    const selectableUsers = users.filter((user) => user.id !== currentUser?.id);
    const allSelectableIds = selectableUsers.map((user) => user.id);
    const allSelected = allSelectableIds.every((id) =>
      selectedUsers.includes(id),
    );

    if (allSelected) {
      // Deselect all
      setSelectedUsers((prevSelected) =>
        prevSelected.filter((id) => !allSelectableIds.includes(id)),
      );
    } else {
      // Select all selectable users
      setSelectedUsers((prevSelected) => {
        const newSelection = [...prevSelected];
        allSelectableIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleBatchDelete = () => {
    setBatchDeleteDialogOpen(true);
  };

  const handleConfirmBatchDelete = () => {
    if (selectedUsers.length > 0) {
      batchDeleteUsers(selectedUsers);
    }
  };

  const handleCloseBatchDeleteDialog = () => {
    setBatchDeleteDialogOpen(false);
  };

  const handleOpenCSVImportDialog = () => {
    setCSVImportDialogOpen(true);
  };

  const handleCloseCSVImportDialog = () => {
    setCSVImportDialogOpen(false);
  };

  const handleCSVImport = async (usersData) => {
    return new Promise((resolve, reject) => {
      bulkImportUsers(usersData, {
        onSuccess: (data) => resolve(data),
        onError: (error) => reject(error),
      });
    });
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
                system. View all users, edit their details, control access
                levels and delete user accounts.
              </Typography>
              <Alert severity="info">
                <Typography variant="body2">
                  Only administrators can edit user accounts and change roles.
                  {window.oAuthData
                    ? " User creation is handled through OAuth authentication. "
                    : " Use the + button to manually create new users. "}
                  Select multiple user accounts to delete in a single batch.
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

      {/* Search Field */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search users by name, email, identifier, affiliation, or origin (min 3 characters)"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  edge="end"
                  aria-label="clear search"
                >
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {debouncedSearchTerm.length > 0 && debouncedSearchTerm.length < 3 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Enter at least 3 characters to filter users
          </Typography>
        )}
      </Box>

      {/* Batch Selection Toolbar */}
      {selectedUsers.length > 0 && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            bgcolor: "primary.light",
            borderRadius: 1,
            mb: 2,
            minHeight: "auto !important",
            py: 1,
          }}
        >
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="primary.contrastText"
            variant="subtitle1"
            component="div"
          >
            {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""}{" "}
            selected
          </Typography>
          <Button
            variant="contained"
            color="error"
            startIcon={<Delete />}
            onClick={handleBatchDelete}
            disabled={isDeletingBatch}
            size="small"
            sx={{ whiteSpace: "nowrap", px: 3, py: 1 }}
          >
            Delete Selected
          </Button>
        </Toolbar>
      )}

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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Tabs value={selectedTab} onChange={handleTabChange}>
                {userGroups.map((group, index) => (
                  <Tab
                    key={group.group_id}
                    label={`${group.description} (${group.users.length})`}
                    id={`users-tab-${index}`}
                  />
                ))}
                {!window.oAuthData && (
                  <>
                    <Tab
                      key="add-user-button-tab"
                      icon={<Add fontSize="small" />}
                      sx={{ p: 1, minWidth: "auto" }}
                      value={userGroups.length}
                      aria-label="Add new user"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDialogMode("create");
                        setSelectedUser(null);
                        setUserFormDialogOpen(true);
                      }}
                    />
                    <Tab
                      key="csv-import-button-tab"
                      icon={<ArrowUpward fontSize="small" />}
                      sx={{ p: 1, minWidth: "auto" }}
                      value={userGroups.length + 1}
                      aria-label="Import users from CSV"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCSVImportDialog();
                      }}
                    />
                  </>
                )}
              </Tabs>
              {userGroups[selectedTab] &&
                (() => {
                  const selectableUsers = userGroups[selectedTab].users.filter(
                    (u) => u.id !== currentUser?.id,
                  );
                  const allSelected =
                    selectableUsers.length > 0 &&
                    selectableUsers.every((user) =>
                      selectedUsers.includes(user.id),
                    );

                  return (
                    <FormControlLabel
                      control={
                        <Checkbox
                          indeterminate={
                            selectedUsers.length > 0 &&
                            selectedUsers.length < selectableUsers.length
                          }
                          checked={allSelected}
                          onChange={() =>
                            handleSelectAll(userGroups[selectedTab].users)
                          }
                          disabled={selectableUsers.length === 0}
                        />
                      }
                      label={allSelected ? "Deselect All" : "Select All"}
                      sx={{ mr: 2 }}
                    />
                  );
                })()}
            </Box>
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
                          isSelected={selectedUsers.includes(user.id)}
                          onSelect={handleUserSelect}
                          isCurrentUser={user.id === currentUser?.id}
                          showCheckbox={true}
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
        onProjectClick={handleProjectClick}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteUserConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        user={userToDelete}
        isDeleting={isDeletingUser}
      />

      {/* Batch Delete Confirmation Dialog */}
      <DeleteUserConfirmationDialog
        open={batchDeleteDialogOpen}
        onClose={handleCloseBatchDeleteDialog}
        onConfirm={handleConfirmBatchDelete}
        users={selectedUsers
          .map((id) =>
            userGroups.flatMap((g) => g.users).find((u) => u.id === id),
          )
          .filter(Boolean)}
        isDeleting={isDeletingBatch}
        isBatch={true}
      />

      {/* Project Details Modal */}
      <ProjectDetailsModal
        open={projectModalOpen}
        onClose={handleProjectModalClose}
        project={selectedProject}
        onUserClick={handleUserClickFromProject}
      />

      {/* CSV Import Dialog */}
      <CSVImportDialog
        open={csvImportDialogOpen}
        onClose={handleCloseCSVImportDialog}
        onImport={handleCSVImport}
        isImporting={isImportingUsers}
      />
    </Box>
  );
};

export default UsersComponent;
