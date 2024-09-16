import * as React from "react";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import PersonIcon from "@mui/icons-material/Person";
import Avatar from "@mui/material/Avatar";

import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

const UserListEntry = ({ user, onDelete, disabled = false }) => {
  return (
    <ListItem
      secondaryAction={
        <IconButton
          edge="end"
          onClick={() => onDelete(user.id)}
          disabled={disabled}
        >
          <DeleteIcon />
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Avatar>
          <PersonIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={user.name} secondary={user.email} />
    </ListItem>
  );
};

export default UserListEntry;
