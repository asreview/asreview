import React from "react";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  Tooltip,
  Checkbox,
} from "@mui/material";
import {
  AdminPanelSettingsOutlined,
  PersonOutlined,
  MoreVertOutlined,
} from "@mui/icons-material";

import UserActionsMenu from "./UserActionsMenu";

const UserCard = ({
  user,
  onEdit,
  onDelete,
  isAdmin,
  isSelected,
  onSelect,
  isCurrentUser,
  showCheckbox,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleCheckboxChange = (event) => {
    event.stopPropagation();
    onSelect(user.id, event.target.checked);
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        "&:hover": {
          filter: "brightness(0.96)",
        },
        position: "relative",
      }}
      onDoubleClick={() => onEdit(user)}
    >
      {/* Selection Checkbox */}
      {showCheckbox && !isCurrentUser && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 1,
          }}
        >
          <Checkbox
            checked={isSelected}
            onChange={handleCheckboxChange}
            size="small"
            sx={{
              color: "primary.main",
              "&.Mui-checked": {
                color: "primary.main",
              },
            }}
          />
        </Box>
      )}
      <CardContent
        sx={{ flexGrow: 1, pb: 1, pt: showCheckbox && !isCurrentUser ? 3 : 2 }}
      >
        <Stack spacing={2} alignItems="center">
          {isCurrentUser && (
            <Chip
              label="You"
              size="small"
              color="info"
              variant="filled"
              sx={{ alignSelf: "center", mb: 1 }}
            />
          )}
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: user.role === "admin" ? "error.main" : "primary.main",
            }}
          >
            {user.role === "admin" ? (
              <AdminPanelSettingsOutlined />
            ) : (
              <PersonOutlined />
            )}
          </Avatar>

          <Box sx={{ textAlign: "center", width: "100%" }}>
            <Tooltip
              title={user.email || "No email available"}
              arrow
              placement="top"
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontSize: "1rem",
                  lineHeight: 1.2,
                  mb: 0.5,
                  cursor: "help",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {user.name || user.identifier || "No Name"}
              </Typography>
            </Tooltip>

            {user.affiliation && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user.affiliation}
              </Typography>
            )}

            <Chip
              label={user.role}
              size="small"
              color={user.role === "admin" ? "error" : "primary"}
              variant="outlined"
            />
          </Box>
        </Stack>
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: "space-between", px: 2, py: 1 }}>
        <Chip
          label={user.confirmed ? "Confirmed" : "Pending"}
          size="small"
          color={user.confirmed ? "success" : "warning"}
          variant="filled"
        />

        <Box>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            disabled={!isAdmin}
          >
            <MoreVertOutlined fontSize="small" />
          </IconButton>

          <UserActionsMenu
            anchorEl={menuAnchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            onEdit={onEdit}
            onDelete={onDelete}
            user={user}
          />
        </Box>
      </CardActions>
    </Card>
  );
};

export default UserCard;
