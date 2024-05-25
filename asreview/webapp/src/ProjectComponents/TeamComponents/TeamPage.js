import * as React from "react";
import { useQuery, useMutation } from "react-query";
import { useParams } from "react-router-dom";
import { Box, Fade, Grid, Snackbar, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { PageHeader } from "Components";
import { TeamAPI } from "api";
import InvitationForm from "./InvitationForm";
import {
  ConfirmationDialog,
  UserListComponent
} from "ProjectComponents/TeamComponents";

const Root = styled("div")(({ theme }) => ({}));
const initSnackbarData = { show: false, message: "" };

const TeamPage = (props) => {
  const { project_id } = useParams();
  const [selectableUsers, setSelectableUsers] = React.useState([]);
  const [collaborators, setCollaborators] = React.useState([]);
  const [invitedUsers, setInvitedUsers] = React.useState([]);
  const [snackbar, setSnackbar] = React.useState(initSnackbarData);
  const [endCollaborationDialog, setEndCollaborationDialog] =
    React.useState(false);

  const handleCloseSnackbar = () => {
    setSnackbar(initSnackbarData);
  };

  const usersQuery = useQuery(["fetchUsers", project_id], TeamAPI.fetchUsers, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      // filter all collaborators and invited people from users
      const associatedUsers = [...data.collaborators, ...data.invitations];
      const allUsers = data.all_users;
      //
      setSelectableUsers((state) =>
        allUsers
          .filter((item) => !associatedUsers.includes(item.id))
          .sort((a, b) => a.name.toLowerCase() - b.name.toLowerCase())
      );
      setCollaborators((state) =>
        allUsers.filter((item) => data.collaborators.includes(item.id))
      );
      setInvitedUsers((state) =>
        allUsers.filter((item) => data.invitations.includes(item.id))
      );
    },
  });

  const inviteUser = useMutation((data) => TeamAPI.inviteUser(data), {
    onSuccess: (response, inputParams) => {
      // get the user
      const user = inputParams.user;
      // remove user from allUsers
      const index = selectableUsers.findIndex((item) => item.id === user.id);
      //
      setSelectableUsers((state) => [
        ...selectableUsers.slice(0, index),
        ...selectableUsers.slice(index + 1),
      ]);
      // set in Pending invitations
      setInvitedUsers((state) =>
        [...invitedUsers, user].sort((a, b) =>
          a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
        )
      );
      //
      setSnackbar({
        show: true,
        message: `You have invited ${user.name} to collaborate on this project`,
      });
    },
    onError: (error) => {
      console.error(error);
      //
      setSnackbar({
        show: true,
        message: `Unable to invite the selected user`,
      });
    },
  });

  const deleteInvitation = useMutation(
    (data) => TeamAPI.deleteInvitation(data),
    {
      onSuccess: (response, inputParams) => {
        // get the userId
        const userId = inputParams.userId;
        // remove user from invitedUsers
        const index = invitedUsers.findIndex((item) => item.id === userId);
        const user = invitedUsers[index];
        //
        setInvitedUsers((state) => [
          ...invitedUsers.slice(0, index),
          ...invitedUsers.slice(index + 1),
        ]);
        // set in selectable users
        setSelectableUsers((state) =>
          [...selectableUsers, user].sort((a, b) =>
            a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
          )
        );
        //
        setSnackbar({
          show: true,
          message: "Removed invitation",
        });
      },
      onError: (error) => {
        console.log(error);
        //
        setSnackbar({
          show: true,
          message: "Unable to remove invitation",
        });
      },
    }
  );

  const onInvite = (userObject) => {
    if (userObject !== null) {
      inviteUser.mutate({ projectId: project_id, user: userObject });
    }
  };

  const onDeleteInvitation = (userId) => {
    if (userId !== null) {
      deleteInvitation.mutate({ projectId: project_id, userId: userId });
    }
  };

  // const inviteUser = () => {
  //   if (selectedUser) {
  //     TeamAPI.inviteUser(project_id, selectedUser.id)
  //       .then((data) => {
  //         if (data.success) {
  //           // add this user to the invited users (ofEffect will take care of the rest
  //           // -autocomplete-)
  //           setInvitedUsers((state) => new Set([...state, selectedUser.id]));
  //           // set selected value to null
  //           setSelectedUser(null);
  //         } else {
  //           console.log("Could not invite user -- DB failure");
  //         }
  //       })
  //       .catch((err) => console.log("Could not invite user", err));
  //   }
  // };

  return (
    <Root aria-label="teams page">
      <Fade in>
        <Box>
          <PageHeader header="Team" mobileScreen={props.mobileScreen} />

          <Box className="main-page-body-wrapper">
            <Stack spacing={3} className="main-page-body">
              {!usersQuery.isFetching && props.isOwner && (
                <Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <InvitationForm
                        selectableUsers={selectableUsers}
                        onInvite={onInvite}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <UserListComponent
                        header="Collaborators"
                        users={collaborators}
                        onDelete={onDeleteInvitation}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <UserListComponent
                        header="Pending invitations"
                        users={invitedUsers}
                        onDelete={onDeleteInvitation}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>
      </Fade>

      <ConfirmationDialog
        open={endCollaborationDialog}
        // title={`Remove "${
        //   removeUser && Boolean(removeUser.name) ? removeUser.name : "unknown"
        // }" from project`}
        // contents={
        //   "Are you sure? You will remove this person from this project if you click on the 'Remove' button."
        // }
        // handleCancel={handleCloseConfirmationDialog}
        // handleConfirm={removeCollaborator}
      />

      <Snackbar
        open={snackbar.show}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Root>
  );
};

export default TeamPage;
