import React from "react";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Box,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DeleteOutlined } from "@mui/icons-material";
import UserAvatar from "./UserAvatar";

const UserListItem = ({
  user,
  showPendingChip = false,
  showDeleteButton = false,
  onDelete,
  disableDelete = false,
  onUserClick,
}) => {
  const handleUserClick = () => {
    if (onUserClick) {
      onUserClick(user);
    }
  };
  return (
    <ListItem
      sx={{
        px: 0,
        py: 1,
        cursor: onUserClick ? "pointer" : "default",
        "&:hover": {
          backgroundColor: onUserClick ? "action.hover" : "transparent",
          borderRadius: 1,
        },
      }}
      onClick={handleUserClick}
    >
      <ListItemAvatar>
        <UserAvatar user={user} isOwner={user.owner} isPending={user.pending} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: onUserClick ? "primary.main" : "text.primary",
                "&:hover": {
                  textDecoration: onUserClick ? "underline" : "none",
                },
              }}
            >
              {user.name || user.email}
            </Typography>
            {showPendingChip && user.pending && (
              <Chip
                label="Pending"
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        }
        secondary={
          <Stack spacing={0.5}>
            <Typography variant="body2" color="textSecondary">
              {user.email}
            </Typography>
            {user.affiliation && (
              <Typography variant="body2" color="textSecondary">
                {user.affiliation}
              </Typography>
            )}
          </Stack>
        }
      />
      {showDeleteButton && (
        <Tooltip title={user.pending ? "Cancel invitation" : "Remove member"}>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete?.(user)}
            disabled={disableDelete}
            sx={{ ml: 1 }}
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </ListItem>
  );
};

export default UserListItem;
