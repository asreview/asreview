import * as React from "react";
import { useQuery, useMutation } from "react-query";
import { Box, Fade, Grid2 as Grid, Snackbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import { PageHeader } from "Components";
import { TeamAPI } from "api";
import {
  ConfirmationDialog,
  InvitationForm,
  UserListComponent,
} from "ProjectComponents/TeamComponents";
import { useParams } from "react-router-dom";

const initSnackbarData = { show: false, message: "" };
const initDeleteData = {
  openDialog: false,
  userId: undefined,
  text: undefined,
  function: undefined,
};
const TeamPage = ({ mobileScreen }) => {
  const { project_id } = useParams();

  const [selectableUsers, setSelectableUsers] = React.useState([]);
  const [collaborators, setCollaborators] = React.useState([]);
  const [invitedUsers, setInvitedUsers] = React.useState([]);
  const [snackbar, setSnackbar] = React.useState(initSnackbarData);
  const [handleDelete, setHandleDelete] = React.useState(initDeleteData);
  const handleCloseSnackbar = () => {
    setSnackbar(initSnackbarData);
  };
  useQuery(["fetchUsers", project_id], TeamAPI.fetchUsers, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      // filter all collaborators and invited people from users
      const associatedUsers = [...data.collaborators, ...data.invitations];
      const allUsers = data.all_users;
      //
      setSelectableUsers((state) =>
        allUsers
          .filter((item) => !associatedUsers.includes(item.id))
          .sort((a, b) => a.name.toLowerCase() - b.name.toLowerCase()),
      );
      setCollaborators((state) =>
        allUsers.filter((item) => data.collaborators.includes(item.id)),
      );
      setInvitedUsers((state) =>
        allUsers.filter((item) => data.invitations.includes(item.id)),
      );
    },
  });
  const inviteUser = useMutation(
    (user) => TeamAPI.inviteUser({ projectId: project_id, user: user }),
    {
      onSuccess: (response, user) => {
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
            a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1,
          ),
        );
        //
        setSnackbar({
          show: true,
          message: `You have invited ${user.name} to collaborate on this project`,
        });
      },
      onError: () => {
        setSnackbar({
          show: true,
          message: `Unable to invite the selected user`,
        });
      },
    },
  );
  const deleteInvitation = useMutation(
    (userId) =>
      TeamAPI.deleteInvitation({ projectId: project_id, userId: userId }),
    {
      onSuccess: (response, userId) => {
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
            a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1,
          ),
        );
        //
        setSnackbar({
          show: true,
          message: "Removed invitation",
        });
      },
      onError: () => {
        setSnackbar({
          show: true,
          message: "Unable to remove invitation",
        });
      },
    },
  );
  const deleteCollaboration = useMutation(
    (userId) =>
      TeamAPI.deleteCollaboration({ projectId: project_id, userId: userId }),
    {
      onSuccess: (response, userId) => {
        // remove user from invitedUsers
        const index = collaborators.findIndex((item) => item.id === userId);
        const user = collaborators[index];
        //
        setCollaborators((state) => [
          ...invitedUsers.slice(0, index),
          ...invitedUsers.slice(index + 1),
        ]);
        // set in selectable users
        setSelectableUsers((state) =>
          [...selectableUsers, user].sort((a, b) =>
            a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1,
          ),
        );
        //
        setSnackbar({
          show: true,
          message: "Ended collaboration",
        });
      },
      onError: () => {
        setSnackbar({
          show: true,
          message: "Unable to remove the collaborator",
        });
      },
    },
  );
  const onInvite = (userObject) => {
    if (userObject !== null) {
      inviteUser.mutate(userObject);
    }
  };
  const onDeleteInvitation = (userId) => {
    if (userId !== null) {
      setHandleDelete({
        openDialog: true,
        userId: userId,
        text: "Do you really want to delete this invitation?",
        function: deleteInvitation,
      });
    }
  };
  const onDeleteCollaboration = (userId) => {
    if (userId !== null) {
      setHandleDelete({
        openDialog: true,
        userId: userId,
        text: "Do you really want to delete this collaborator?",
        function: deleteCollaboration,
      });
    }
  };

  return (
    <Box>
      <PageHeader header="Team" mobileScreen={mobileScreen} />
      <Box className="main-page-body-wrapper">
        <Grid container spacing={3}>
          <Grid size={12}>
            <InvitationForm
              selectableUsers={selectableUsers}
              onInvite={onInvite}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <UserListComponent
              header="Collaborators"
              users={collaborators}
              onDelete={onDeleteCollaboration}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <UserListComponent
              header="Pending invitations"
              users={invitedUsers}
              onDelete={onDeleteInvitation}
            />
          </Grid>
        </Grid>
        <Snackbar
          open={snackbar.show}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          message={snackbar.message}
        />
        <ConfirmationDialog
          title="Are you sure?"
          contentText={handleDelete.text}
          open={handleDelete.openDialog}
          onClose={() => setHandleDelete(initDeleteData)}
          handleCancel={() => setHandleDelete(initDeleteData)}
          handleConfirm={() => {
            handleDelete.function.mutate(handleDelete.userId);
            setHandleDelete(initDeleteData);
          }}
        />
      </Box>
    </Box>
  );
};
export default TeamPage;
