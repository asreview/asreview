import * as React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { TeamAPI } from "api";
import List from "@mui/material/List";
import { Add } from "@mui/icons-material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import UserListEntry from "./UserListEntry";
import { Box, Fab, Grid } from "@mui/material";
import { ConfirmationDialog } from ".";

const InvitationForm = (props) => {
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [removeUser, setRemoveUser] = React.useState(null);
  const [inputValue, setInputValue] = React.useState("");
  const [allUsers, setAllUsers] = React.useState([]);
  const [associatedUsers, setAssociatedUsers] = React.useState(new Set([]));
  const { project_id } = useParams();
  const [dialogOpen, setDialogOpen] = React.useState(false);


//   const inviteUser = () => {
//     if (selectedUser) {
//       TeamAPI.inviteUser(project_id, selectedUser.id)
//         .then((data) => {
//           if (data.success) {
//             // add this user to the invited users (ofEffect will take care of the rest
//             // -autocomplete-)
//             setInvitedUsers((state) => new Set([...state, selectedUser.id]));
//             // set selected value to null
//             setSelectedUser(null);
//           } else {
//             console.log("Could not invite user -- DB failure");
//           }
//         })
//         .catch((err) => console.log("Could not invite user", err));
//     }
//   };



  return (
    <Box>
      <Grid container spacing={3}>
      <Autocomplete
        id="select-potential-collaborators"
        value={selectedUser}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(event, newValue = null) => {
          if (newValue !== null) {
            setSelectedUser(newValue);
          }
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        options={props.allUsers.filter((item) => !associatedUsers.has(item.id))}
        getOptionLabel={(option) => `${option.name}`}
        sx={{ width: 400, padding: 1 }}
        renderOption={(props, option) => {
          return <li {...props} key={option.id}>{option.name}</li>;
        }}
        renderInput={(params) => (
            <TextField {...params} label="Select a user" />
        )}
      />
      <Fab
        className=""
        color="primary"
        //onClick={}
        variant="extended"
        sx={{ width: 120, padding: 1, margin: 2 }}
        >
        <Add sx={{ mr: 1 }} />
        Invite
      </Fab>
      </Grid>
    </Box>
  );
};

export default InvitationForm;
