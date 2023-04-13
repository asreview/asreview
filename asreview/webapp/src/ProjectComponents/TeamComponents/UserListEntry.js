import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import { blue } from '@mui/material/colors';

const UserListEntry = (props) => {
  return (
    <ListItem
      button 
      onDoubleClick={() => props.onDoubleClick(props.user)}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
          <PersonIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={props.user.name} secondary={props.user.email} />
    </ListItem>
  );
}

export default UserListEntry;