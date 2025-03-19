import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";

import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

import { InitialsAvatar } from "StyledComponents/InitialsAvatar";

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
        <InitialsAvatar name={user.name} />
      </ListItemAvatar>
      <ListItemText primary={user.name} secondary={user.email} />
    </ListItem>
  );
};

export default UserListEntry;
