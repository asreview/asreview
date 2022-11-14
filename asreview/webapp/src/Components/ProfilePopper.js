import * as React from "react";
import { useDispatch } from "react-redux";
import { useMutation, useQuery } from "react-query";
import {
  Avatar,
  Badge,
  Box,
  ButtonBase,
  ClickAwayListener,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import MailIcon from '@mui/icons-material/Mail';
import { styled } from "@mui/material/styles";
import { Logout, GroupAdd } from "@mui/icons-material";

import { StyledMenuItem } from "../StyledComponents/StyledMenuItem";
import { TypographySubtitle1Medium } from "../StyledComponents/StyledTypography";

import { AuthAPI, CollaborationAPI, ProjectAPI } from "../api";
import useAuth from "../hooks/useAuth";
import ElasAvatar from "../images/ElasAvatar.svg";

import { AcceptanceDialog } from "../ProjectComponents/CollaborationComponents";
import { useToggle } from "../hooks/useToggle";
import { setMyProjects } from "../redux/actions";

const Root = styled("div")(({ theme }) => ({}));

const ProfilePopper = (props) => {
  const { auth, setAuth } = useAuth();
  const [projectInvitations, setProjectInvitations] = React.useState([]);
  const dispatch = useDispatch();

  const [onAcceptanceDialog, toggleAcceptanceDialog] = useToggle();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  useQuery(
    ["getProjectInvitations"],
    () => CollaborationAPI.getProjectInvitations(auth.id),
    {
      onSuccess: (data) => {
        setProjectInvitations((data['invited_for_projects'] || []));
      },
      onError: (data) => {
        console.log('error', data);
      }
    }
  );

  const { mutate } = useMutation(AuthAPI.signout, {
    onSuccess: () => {
      setAuth({});
    },
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((prev) => !prev);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const handleSignOut = () => {
    mutate();
  };

  const openAcceptanceDialog = () => {
    setOpen(false);
    toggleAcceptanceDialog();
  };

  const acceptanceHandler = (project) => {
    // Call the API to accept the invitation, if that is successful
    // get list of all projects of this user and refresh the projects
    // list, remove from Dialog
    CollaborationAPI.acceptInvitation(project.project_id, auth.id)
    .then(data => {
      if (data.success) {

        // success, the invite was transformed into a collaboration, get all projects
        ProjectAPI.fetchProjects({})
        .then(data => {
          if (data.result instanceof Array) {
            // refresh project list
            dispatch(setMyProjects(data.result));
            // remove project from Dialog table
            const newProjectList = projectInvitations.filter((p) => p.id !== project.id);
            setProjectInvitations(newProjectList);
            // close modal if there are no more invitations
            if (newProjectList.length === 0) {
              toggleAcceptanceDialog();
            }
          } else {
            console.log('Could not get projects list -- DB failure');
          }
        })
        .catch(err => console.log('Could not pull all projects', err));

      } else {
        console.log('Could not reject invitation -- DB failure');
      }
    })
    .catch(err => console.log('Could not reject invitation', err));
  }

  const rejectionHandler = (project) => {
    // call API to remove the invitation
    CollaborationAPI.rejectInvitation(project.project_id, auth.id)
      .then(data => {
        if (data.success) {
          // remove project from Dialog table and close if there are 
          // no more invitations
          const newProjectList = projectInvitations.filter((p) => p.id !== project.id);
          setProjectInvitations(newProjectList);
          // close modal if there are no more invitations
          if (newProjectList.length === 0) {
            toggleAcceptanceDialog();
          }
        } else {
          console.log('Could not reject invitation -- DB failure');
        }
      })
      .catch(err => console.log('Could not reject invitation', err));
  }

  return (
    <Root>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box>
          <Tooltip title="Profile">
            <ButtonBase onClick={handleClick}>
              <Avatar
                alt="user"
                src={ElasAvatar}
                sx={{
                  width: !props.mobileScreen ? 32 : 24,
                  height: !props.mobileScreen ? 32 : 24,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark" ? "grey.600" : "grey.400",
                }}
                imgProps={{ sx: { p: 1 } }}
              />
            </ButtonBase>
          </Tooltip>
          <Popper
            open={open}
            anchorEl={anchorEl}
            placement="bottom-end"
            sx={{ zIndex: "tooltip", mt: "8px !important" }}
          >
            <Paper variant="outlined">
              <MenuList>
                <StyledMenuItem>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "center" }}
                  >
                    <Avatar
                      alt="user"
                      src={ElasAvatar}
                      sx={{
                        width: !props.mobileScreen ? 40 : 32,
                        height: !props.mobileScreen ? 40 : 32,
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "grey.600"
                            : "grey.400",
                      }}
                      imgProps={{ sx: { p: 1 } }}
                    />
                    <TypographySubtitle1Medium>
                      {auth?.username}
                    </TypographySubtitle1Medium>
                  </Stack>
                </StyledMenuItem>
                <Divider />
                { 
                  projectInvitations.length > 0 &&
                  <MenuItem onClick={openAcceptanceDialog}>
                    <ListItemIcon>
                      <GroupAdd fontSize="small" />
                    </ListItemIcon>
                    <ListItemText disableTypography>
                      <Typography variant="body2">
                        Collaboration Invites
                        <Badge 
                          badgeContent={projectInvitations.length}
                          sx={{"& .MuiBadge-badge": { 
                            color: "white", 
                            backgroundColor: "red",
                            fontSize: 11
                          }}}
                        >
                          <MailIcon color="action" fontSize="small"/>
                        </Badge>
                      </Typography>
                    </ListItemText>
                  </MenuItem>
                }
                <MenuItem onClick={handleSignOut}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText disableTypography>
                    <Typography variant="body2">Sign out</Typography>
                  </ListItemText>
                </MenuItem>

              </MenuList>
            </Paper>
          </Popper>
        </Box>
      </ClickAwayListener>
      <AcceptanceDialog 
        open={onAcceptanceDialog}
        onClose={toggleAcceptanceDialog}
        userId={auth.id}
        projectInvitations={projectInvitations}
        handleAcceptance={acceptanceHandler}
        handleRejection={rejectionHandler}
      />
    </Root>
  );
};

export default ProfilePopper;
