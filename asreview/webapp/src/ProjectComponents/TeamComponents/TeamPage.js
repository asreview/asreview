import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Snackbar,
} from "@mui/material";
import {
  CollaborationPage,
  InvitationForm,
} from "ProjectComponents/TeamComponents";
import { InitialsAvatar } from "StyledComponents/InitialsAvatar";
import { ProjectAPI, TeamAPI } from "api";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";

const initDeleteData = {
  openDialog: false,
  userId: undefined,
  text: undefined,
  function: undefined,
};
const TeamPage = () => {
  const { project_id } = useParams();

  const queryClient = useQueryClient();

  const [snackbar, setSnackbar] = React.useState({ show: false, message: "" });
  const [handleDelete, setHandleDelete] = React.useState(initDeleteData);

  const { data, isSuccess } = useQuery(
    ["fetchUsers", project_id],
    TeamAPI.fetchUsers,
    {
      refetchInterval: 10000,
    },
  );

  const { mutate: removeInvitation } = useMutation(TeamAPI.deleteInvitation, {
    onSuccess: () => {
      queryClient.invalidateQueries(["fetchUsers", project_id]);
      queryClient.invalidateQueries(["fetchProjectInvitations"]);
      setSnackbar({
        show: true,
        message: "Invitation removed",
      });
    },
    onError: () => {
      setSnackbar({
        show: true,
        message: "Unable to remove the invitation",
      });
    },
  });
  const { mutate: removeCollaboration } = useMutation(
    TeamAPI.deleteCollaboration,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["fetchUsers", project_id]);
        queryClient.invalidateQueries(["fetchProjectInvitations"]);
        setSnackbar({
          show: true,
          message: "Collaboration ended",
        });
      },
      onError: () => {
        setSnackbar({
          show: true,
          message: "Unable to end the collaboration",
        });
      },
    },
  );

  const { data: currentUser, isSuccess: isSuccessInfo } = useQuery(
    ["fetchProjectInfo", { project_id }],
    ProjectAPI.fetchInfo,
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <Container maxWidth="md" sx={{ mb: 3 }}>
      {currentUser?.roles?.owner && <InvitationForm project_id={project_id} />}
      <Card sx={{ mt: 3 }}>
        <CardHeader title="Team" />
        <CardContent>
          <List>
            {isSuccess &&
              data
                .filter((user) => user.member || user.pending)
                .map((user) => {
                  const postfix = user.pending
                    ? "(pending)"
                    : user.owner
                      ? "(project owner)"
                      : "";
                  return (
                    <ListItem
                      key={user.id}
                      secondaryAction={
                        user.deletable && (
                          <IconButton
                            edge="end"
                            onClick={() =>
                              setHandleDelete({
                                openDialog: true,
                                userId: user.id,
                                text: user.pending
                                  ? "Do you really want to delete this invitation?"
                                  : "Do you really want to remove this member?",
                                function: () => {
                                  if (user.pending) {
                                    removeInvitation({
                                      projectId: project_id,
                                      userId: user.id,
                                    });
                                  } else if (user.member) {
                                    removeCollaboration({
                                      projectId: project_id,
                                      userId: user.id,
                                    });
                                  }
                                },
                              })
                            }
                          >
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
                })}
          </List>
        </CardContent>
        <Dialog
          open={handleDelete.openDialog}
          onClose={() => setHandleDelete(initDeleteData)}
        >
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogContent>{handleDelete.text}</DialogContent>
          <DialogActions>
            <Button
              onClick={() => setHandleDelete(initDeleteData)}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleDelete.function();
                setHandleDelete(initDeleteData);
              }}
              color="primary"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Card>

      {isSuccessInfo && !currentUser?.roles?.owner && (
        <CollaborationPage project_id={project_id} />
      )}

      <Snackbar
        open={snackbar.show}
        autoHideDuration={3000}
        onClose={() => {
          setSnackbar({ show: false, message: "" });
        }}
        message={snackbar.message}
      />
    </Container>
  );
};
export default TeamPage;
