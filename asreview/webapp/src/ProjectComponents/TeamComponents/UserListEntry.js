import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import PersonIcon from "@mui/icons-material/Person";
import Avatar from "@mui/material/Avatar";
import { blue } from "@mui/material/colors";

const UserListEntry = ({ user, onDelete }) => {
  return (
    <ListItemButton onDoubleClick={() => onDelete(user.id)}>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
          <PersonIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={user.name} secondary={user.email} />
    </ListItemButton>
  );
};

export default UserListEntry;
