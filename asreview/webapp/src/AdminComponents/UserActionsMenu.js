import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const UserActionsMenu = ({
  anchorEl,
  open,
  onClose,
  onEdit,
  onDelete,
  user,
}) => {
  const handleEdit = () => {
    onEdit(user);
    onClose();
  };

  const handleDelete = () => {
    onDelete(user);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <MenuItem onClick={handleEdit}>
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        <ListItemText>Edit User</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
        <ListItemIcon>
          <Delete fontSize="small" sx={{ color: "error.main" }} />
        </ListItemIcon>
        <ListItemText>Delete User</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default UserActionsMenu;
