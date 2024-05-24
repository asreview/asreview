import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import PersonIcon from "@mui/icons-material/Person";
import Avatar from "@mui/material/Avatar";
import { blue } from "@mui/material/colors";

const UserListEntry = ({user}) => {
  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
          <PersonIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={user.name} secondary={user.email} />
    </ListItem>
  );
};

export default UserListEntry;

// button onDoubleClick={() => props.onDoubleClick(user)}>
