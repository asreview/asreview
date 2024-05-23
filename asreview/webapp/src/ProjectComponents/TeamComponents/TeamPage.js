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

const PREFIX = "TeamPage";

const classes = {
  cardWrapper: `${PREFIX}-card-wrapper`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.cardWrapper}`]: {
    paddingTop: 32,
  },
}));

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const TeamPage = (props) => {
  const { project_id } = useParams();
  console.log(project_id);

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
                { !usersQuery.isFetching &&
                  <Box>
                    <Grid container spacing={3}>
                      { console.log(usersQuery.data) }
                      
                      <InvitationForm
                        allUsers={usersQuery.data['all_users']}
                      
                      />

                      <Grid item xs={12} sm={5}>
                        <Item>1</Item>
                        {/* <ProgressChart
                          isSimulating={props.isSimulating}
                          mobileScreen={props.mobileScreen}
                          mode={props.mode}
                          progressQuery={progressQuery}
                        /> */}
                      </Grid>
                      <Grid item xs={12} sm={7}>
                        <Item>2</Item>
                        {/* <Box className="main-page-body-wrapper">
            {props.isOwner && false && <InvitationContents />}
            {!props.isOwner && false && <EndCollaboration />}
          </Box> */}
                        {/* <NumberCard
                          mobileScreen={props.mobileScreen}
                          progressQuery={progressQuery}
                        /> */}
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
