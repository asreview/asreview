import * as React from 'react';
import { notifyManager, useQuery } from "react-query";
import { CollaborationAPI } from "../../api/index.js";
import List from '@mui/material/List';
import { Add } from "@mui/icons-material";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import UserListEntry from "./UserListEntry";
import { Fab } from "@mui/material";


const CollaborationContents = (props) => {

  const [selectedUser, setSelectedUser] = React.useState(null);
  const [inputValue, setInputValue] = React.useState('');
  const [collaborators, setCollaborators] = React.useState(new Set([]));
  const [invitedUsers, setInvitedUsers] = React.useState(new Set([]));
  const [allUsers, setAllUsers] = React.useState([]);
  const [associatedUsers, setAssociatedUsers] = React.useState(new Set([]));

  useQuery(
    ["fetchCollaborators", props.project_id],
    () => CollaborationAPI.fetchCollaborators(props.project_id),
    {
      onSuccess: (data) => {
        setAllUsers(data.all_users || []);
        setCollaborators(new Set(data.collaborators || []));
        setInvitedUsers(new Set(data.invitations || []));
      },
      onError: (data) => {
        console.log('error', data);
      }
    }
  );

  React.useEffect(() => {
    setAssociatedUsers(state => new Set([...collaborators, ...invitedUsers]))
  }, [collaborators, invitedUsers]);

  const inviteUser = () => {
    if (selectedUser) {
      CollaborationAPI.inviteUser(props.project_id, selectedUser.id)
        .then(data => {
          if (data.success) {
            // add this user to the invited users (ofEffect will take care of the rest
            // -autocomplete-)
            setInvitedUsers(state => new Set([...state, selectedUser.id]))
            // set selected value to null
            setSelectedUser(null);
          } else {
            console.log('Could not invite user -- DB failure');
          }
        })
        .catch(err => console.log('Could not invite user', err));
    }
  };

  const removeInvitation = (id) => {
    CollaborationAPI.deleteInvitation(props.project_id, id)
      .then(data => {
        if (data.success) {
          // remove from the invited users list, useEffect will take care of the rest
          // for the autocomplete
          setInvitedUsers(state => {
            state.delete(id);
            return new Set([...state]);
          })
        } else {
          console.log('Could not delete invitation -- DB failure');
        }
      })
      .catch(err => console.log('Could not delete invitation', err));
  }

  const removeCollaborator = (id) => {
    CollaborationAPI.deleteCollaborator(props.project_id, id)
      .then(data => {
        if (data.success) {
          // remove from the collabo users list, useEffect will take care of the rest
          // for the autocomplete
          setCollaborators(state => {
            state.delete(id);
            return new Set([...state]);
          })
        } else {
          console.log('Could not delete invitation -- DB failure');
        }
      })
      .catch(err => console.log('Could not delete invitation', err));
  };

  return (
    <>
      <h2>Invite</h2>
      <Autocomplete
        value={selectedUser}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(event, newValue=null) => {
          if (newValue !== null) {
            setSelectedUser(newValue);
          }
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        id="controllable-states-demo"
        options={ allUsers.filter(item => !associatedUsers.has(item.id)) }
        getOptionLabel={option => option.full_name }
        sx={{ width: 300, padding: 1 }}
        renderInput={(params) => <TextField {...params} label="Select a user" />}
      />
      <Fab
        className=''
        color="primary"
        onClick={inviteUser}
        variant="extended"
        sx={{ width: 120, padding: 1, margin: 2 }}
      >
        <Add sx={{ mr: 1 }} />
        Invite
      </Fab>

      <h2>Pending</h2>
      <p>Double click to remove</p>
      <List sx={{ pt: 0 }}>
      { allUsers.filter(item => invitedUsers.has(item.id)).map((user) => (
        <UserListEntry
          key={user.id}
          id={user.id}
          fullName={user.full_name}
          onDoubleClick={removeInvitation}
        />))
      }
      </List>

      <h2>Collaborators</h2>
      <p>Double click to remove</p>
      <List sx={{ pt: 0 }}>
      { allUsers.filter(item  => collaborators.has(item.id)).map((user) => (
        <UserListEntry
          key={user.id}
          id={user.id}
          fullName={user.full_name}
          onDoubleClick={removeCollaborator}
        />))
      }
      </List>
    </>
  );
}

export default CollaborationContents;