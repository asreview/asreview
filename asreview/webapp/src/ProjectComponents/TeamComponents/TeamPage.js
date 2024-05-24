import * as React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { Box, Fade, Grid, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import Paper from '@mui/material/Paper';

import { PageHeader } from "Components";
import { EndCollaboration, InvitationContents } from ".";

import { TeamAPI } from "api";
import InvitationForm from "./InvitationForm";
import UserListComponent from "./UserListComponent";

const Root = styled("div")(({ theme }) => ({}));

const TeamPage = (props) => {
  const { project_id } = useParams();
  const [collaborators, setCollaborators] = React.useState(new Set([]));
  const [invitedUsers, setInvitedUsers] = React.useState(new Set([]));

  const usersQuery = useQuery(
    ["fetchUsers", project_id],
    TeamAPI.fetchUsers,
    { refetchOnWindowFocus: false },
  );


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

              { !usersQuery.isFetching && props.isOwner &&
                <Box>
                  <Grid container spacing={3}>

                    <Grid item xs={12}>
                      <InvitationForm
                        allUsers={usersQuery.data['all_users']}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <UserListComponent
                        header="Collaborators"
                        users={[]}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <UserListComponent
                        header="Pending invites"
                        users={[]}
                      />
                      {/* <Box className="main-page-body-wrapper">
          {props.isOwner && false && <InvitationContents />}
          {!props.isOwner && false && <EndCollaboration />}
        </Box> */}


                    </Grid>
                  </Grid>
                </Box>
              }
            </Stack>
          </Box>
        </Box>
      </Fade>
    </Root>
  );
};

export default TeamPage;
