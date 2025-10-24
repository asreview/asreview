import React from "react";
import { useQuery } from "react-query";

import {
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Box,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  WorkOutline,
  Groups,
} from "@mui/icons-material";

import { useToggle } from "hooks/useToggle";
import { AdminAPI } from "api";

const UserFormDialog = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  user = null, // null for create, user object for edit
  mode = "create", // "create" or "edit"
  onProjectClick, // Handler for project clicks (passed from parent)
}) => {
  const isEditMode = mode === "edit" && user !== null;

  // Fetch detailed user information when in edit mode
  const {
    data: detailedUser,
    isLoading: isLoadingUser,
    isError: isUserError,
    error: userError,
  } = useQuery(["user", user?.id], () => AdminAPI.fetchUser(user.id), {
    enabled: isEditMode && open && !!user?.id,
    refetchOnWindowFocus: false,
  });

  const [formData, setFormData] = React.useState({
    email: "",
    name: "",
    affiliation: "",
    password: "",
    role: "member",
    confirmed: true,
    public: true,
  });

  const [errors, setErrors] = React.useState({});
  const [showPassword, toggleShowPassword] = useToggle(false);

  // Initialize form data when user prop changes (for edit mode)
  React.useEffect(() => {
    if (isEditMode && (detailedUser?.user || user)) {
      // Use detailed user data if available, otherwise fallback to basic user data
      const userData = detailedUser?.user || user;
      setFormData({
        email: userData.email || "",
        name: userData.name || "",
        affiliation: userData.affiliation || "",
        password: "", // Never pre-fill password
        role: userData.role || "member",
        confirmed: userData.confirmed ?? true,
        public: userData.public ?? true,
      });
    } else {
      // Reset to defaults for create mode
      setFormData({
        email: "",
        name: "",
        affiliation: "",
        password: "",
        role: "member",
        confirmed: true,
        public: true,
      });
    }
    setErrors({});
  }, [isEditMode, user, detailedUser, open]);

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";

    // Password validation - always required for new users, optional for edit
    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = "Password is required for new users";
    }
    // For edit mode, password is optional (only validate if provided)
    if (
      isEditMode &&
      formData.password.trim() &&
      formData.password.length < 8
    ) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    // For new users, validate password length if provided
    if (
      !isEditMode &&
      formData.password.trim() &&
      formData.password.length < 8
    ) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const submitData = { ...formData };

      // For edit mode, don't send password if it's empty
      if (isEditMode && !submitData.password.trim()) {
        delete submitData.password;
      }

      onSubmit(submitData);
    }
  };

  const handleClose = () => {
    setFormData({
      email: "",
      name: "",
      affiliation: "",
      password: "",
      role: "member",
      confirmed: true,
      public: true,
    });
    setErrors({});
    onClose();
  };

  const handleProjectClick = (project) => {
    if (onProjectClick) {
      onProjectClick(project);
      onClose(); // Close user modal when opening project modal
    }
  };

  const dialogTitle = isEditMode
    ? `Edit User: ${user?.name || user?.email || user?.identifier}`
    : "Create New User";
  const submitButtonText = isEditMode
    ? isSubmitting
      ? "Updating..."
      : "Update User"
    : isSubmitting
      ? "Creating..."
      : "Create User";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {!window.oAuthData && isEditMode && (
            <Alert severity="info">
              <Typography variant="body2">
                Leave password field empty to keep current password unchanged.
              </Typography>
            </Alert>
          )}

          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            required
          />

          <TextField
            label="Name"
            value={formData.name}
            onChange={handleChange("name")}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
          />

          <TextField
            label="Affiliation"
            value={formData.affiliation}
            onChange={handleChange("affiliation")}
            fullWidth
          />

          {/* Only show password field for non-OAuth users or when creating new users */}
          {(!window.oAuthData || !isEditMode) && (
            <FormControl variant="outlined" fullWidth error={!!errors.password}>
              <InputLabel htmlFor="password">
                {isEditMode ? "New Password (optional)" : "Password"}
              </InputLabel>
              <OutlinedInput
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange("password")}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword
                          ? "hide the password"
                          : "display the password"
                      }
                      onClick={toggleShowPassword}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseUp={(event) => event.preventDefault()}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label={isEditMode ? "New Password (optional)" : "Password"}
                autoComplete={isEditMode ? "new-password" : "new-password"}
                required={!isEditMode}
              />
              {(errors.password || (isEditMode && !errors.password)) && (
                <Typography
                  variant="caption"
                  color={errors.password ? "error" : "text.secondary"}
                  sx={{ mt: 0.5, ml: 1.5 }}
                >
                  {errors.password ||
                    (isEditMode ? "Leave empty to keep current password" : "")}
                </Typography>
              )}
            </FormControl>
          )}

          {/* Show info message when password field is hidden for OAuth users */}
          {window.oAuthData && isEditMode && (
            <Alert severity="info">
              <Typography variant="body2">
                Password cannot be changed for OAuth users. Authentication is
                managed externally.
              </Typography>
            </Alert>
          )}

          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={handleChange("role")}
            >
              <MenuItem value="member">Member</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
            </Select>
          </FormControl>

          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.confirmed}
                  onChange={handleChange("confirmed")}
                />
              }
              label="Confirmed"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.public}
                  onChange={handleChange("public")}
                />
              }
              label="Public"
            />
          </Stack>

          {/* Project Information Section - Only in Edit Mode */}
          {isEditMode && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontSize: "1rem" }}>
                  Project Information
                </Typography>

                {isLoadingUser ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      Loading project information...
                    </Typography>
                  </Box>
                ) : isUserError ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Failed to load project information:{" "}
                      {userError?.message || "Unknown error"}
                    </Typography>
                  </Alert>
                ) : detailedUser?.user?.projects ? (
                  <>
                    {detailedUser.user.projects.length > 0 ? (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          This user is involved in{" "}
                          {detailedUser.user.projects.length} project
                          {detailedUser.user.projects.length !== 1 ? "s" : ""}:
                        </Typography>
                        <Stack spacing={1}>
                          {detailedUser.user.projects.map((project) => (
                            <Box
                              key={project.id}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                p: 1.5,
                                border: 1,
                                borderColor: "divider",
                                borderRadius: 1,
                                bgcolor: "background.paper",
                              }}
                            >
                              {project.role === "owner" ? (
                                <WorkOutline
                                  sx={{ color: "primary.main", fontSize: 20 }}
                                />
                              ) : (
                                <Groups
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                              )}
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: "medium",
                                    color: "primary.main",
                                    cursor: "pointer",
                                    "&:hover": {
                                      textDecoration: "underline",
                                    },
                                  }}
                                  onClick={() => handleProjectClick(project)}
                                >
                                  {project.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  ID: {project.project_id}
                                </Typography>
                              </Box>
                              <Chip
                                label={
                                  project.role === "owner"
                                    ? "Owner"
                                    : "Collaborator"
                                }
                                size="small"
                                color={
                                  project.role === "owner"
                                    ? "primary"
                                    : "default"
                                }
                                variant="outlined"
                              />
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        This user is not currently involved in any projects.
                      </Typography>
                    )}
                  </>
                ) : null}
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
        >
          {submitButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;
