import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";

import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

import { InitialsAvatar } from "StyledComponents/InitialsAvatar";

const UserListEntry = ({ user, onRemove }) => {
  let postfix = "";
  if (user.pending) postfix = "(pending)";
  // owner can't have pending status
  if (user.owner) postfix = "(project owner)";

  return (
    <ListItem
      secondaryAction={
        user.deletable && (
          <IconButton edge="end" onClick={() => onRemove(user)}>
            <DeleteIcon />
          </IconButton>
        )
      }
    >
      <ListItemAvatar>
        <InitialsAvatar name={user.name} />
      </ListItemAvatar>
      <ListItemText
        primary={`${user.name} ${postfix}`}
        secondary={user.email}
      />
    </ListItem>
  );
};

export default UserListEntry;
