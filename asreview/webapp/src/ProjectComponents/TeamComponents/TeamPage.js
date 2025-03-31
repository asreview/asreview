import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid2 as Grid,
  List,
  Snackbar,
} from "@mui/material";
import {
  CollaborationPage,
  ConfirmationDialog,
  InvitationForm,
  UserListEntry,
} from "ProjectComponents/TeamComponents";
import { ProjectAPI, TeamAPI } from "api";
import * as React from "react";
import { useMutation, useQuery } from "react-query";
import { useParams } from "react-router-dom";

const initSnackbarData = { show: false, message: "" };
const initDeleteData = {
  openDialog: false,
  userId: undefined,
  text: undefined,
  function: undefined,
};
const TeamPage = () => {
  const { project_id } = useParams();

  const [owner, setOwner] = React.useState(false);
  const [selectableUsers, setSelectableUsers] = React.useState([]);
  const [members, setMembers] = React.useState([]);
  const [snackbar, setSnackbar] = React.useState(initSnackbarData);
  const [handleDelete, setHandleDelete] = React.useState(initDeleteData);
  const handleCloseSnackbar = () => {
    setSnackbar(initSnackbarData);
  };

  useQuery(["fetchUsers", project_id], TeamAPI.fetchUsers, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      const selectables = [];
      const members = [];

      data.forEach((user) => {
        if (user.selectable) {
          selectables.push(user);
        } else {
          members.push(user);
        }
        if (user.owner && user.me) setOwner(true);
      });

      setSelectableUsers((state) => selectables);
      setMembers((state) => members);
    },
  });

  const inviteUser = useMutation(
    (oldUser) => TeamAPI.inviteUser({ projectId: project_id, user: oldUser }),
    {
      onSuccess: (updatedUser, oldUser) => {
        // remove user from allUsers
        const index = selectableUsers.findIndex(
          (item) => item.id === oldUser.id,
        );
        // cut user out
        setSelectableUsers((state) => [
          ...selectableUsers.slice(0, index),
          ...selectableUsers.slice(index + 1),
        ]);
        // put in members invitations
        setMembers((state) =>
          [...members, updatedUser].sort((a, b) =>
            a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1,
          ),
        );
        //
        setSnackbar({
          show: true,
          message: `You have invited ${updatedUser.name} to collaborate on this project`,
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

  const removeUser = useMutation(
    ({ userId, type }) => {
      return type === "invitation"
        ? TeamAPI.deleteInvitation({ projectId: project_id, userId })
        : TeamAPI.deleteCollaboration({ projectId: project_id, userId });
    },
    {
      onSuccess: (updatedUser, { userId, type }) => {
        // remove user from invitedUsers
        const index = members.findIndex((item) => item.id === userId);
        // remove from members
        setMembers((state) => [
          ...members.slice(0, index),
          ...members.slice(index + 1),
        ]);
        // put back in selectable users
        setSelectableUsers((state) =>
          [...selectableUsers, updatedUser].sort((a, b) =>
            a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1,
          ),
        );
        //
        setSnackbar({
          show: true,
          message:
            type === "invitation"
              ? "Removed invitation"
              : "Ended collaboration",
        });
      },
      onError: ({ type }) => {
        setSnackbar({
          show: true,
          message:
            type === "invitation"
              ? "Unable to remove invitation"
              : "Unable to remove the collaborator",
        });
      },
    },
  );

  const onInvite = (userObject) => {
    if (userObject !== null) {
      inviteUser.mutate(userObject);
    }
  };

  const onRemoveUser = (user) => {
    if (user !== null) {
      setHandleDelete({
        openDialog: true,
        userId: user.id,
        text: user.pending
          ? "Do you really want to delete this invitation?"
          : "Do you really want to remove this member?",
        function: () => {
          if (user.pending) {
            removeUser.mutate({ userId: user.id, type: "invitation" });
          } else if (user.member) {
            removeUser.mutate({ userId: user.id, type: "collaboration" });
          }
        },
      });
    }
  };

  const { data } = useQuery(
    ["fetchProjectInfo", { project_id }],
    ProjectAPI.fetchInfo,
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <Container maxWidth="md" sx={{ mb: 3 }}>
      <Grid container spacing={3}>
        <Grid size={12}>
          {owner && (
            <InvitationForm
              selectableUsers={selectableUsers}
              onInvite={onInvite}
            />
          )}
          {data && !data?.roles.owner && <CollaborationPage />}
        </Grid>
        <Grid size={12}>
          <Card>
            <CardHeader title="Members" />
            <CardContent>
              <List>
                {members.map((user) => (
                  <UserListEntry
                    key={user.id}
                    user={user}
                    onRemove={onRemoveUser}
                  />
                ))}
              </List>
            </CardContent>
          </Card>
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
          handleDelete.function();
          setHandleDelete(initDeleteData);
        }}
      />
    </Container>
  );
};
export default TeamPage;
