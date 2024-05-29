import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
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
import { styled } from "@mui/material/styles";
import { Logout, GroupAdd, Person } from "@mui/icons-material";

import { StyledMenuItem } from "StyledComponents/StyledMenuItem";
import { TypographySubtitle1Medium } from "StyledComponents/StyledTypography";

import { AuthAPI, TeamAPI } from "api";
import useAuth from "hooks/useAuth";
import ElasAvatar from "images/ElasAvatar.svg";

import { InvitationsDialog } from "ProjectComponents/TeamComponents";
import { useToggle } from "hooks/useToggle";

const Root = styled("div")(({ theme }) => ({}));

const ProfilePopper = (props) => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [projectInvitations, setProjectInvitations] = React.useState([]);
  const [onAcceptanceDialog, toggleAcceptanceDialog] = useToggle();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState(false);

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

  const handleProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  useQuery(["getProjectInvitations"], () => TeamAPI.getProjectInvitations(), {
    onSuccess: (data) => {
      setProjectInvitations(data["invited_for_projects"] || []);
    },
    onError: (data) => {
      console.log("error", data);
    },
    enabled: window.allowTeams,
  });

  const acceptInvitation = useMutation(
    (project) => TeamAPI.acceptInvitation(project.project_id),
    {
      onSuccess: (response, project) => {
        // refetch all projects
        queryClient.invalidateQueries({ queryKey: ["fetchProjects", project.mode]});
        // filter out accepted project
        const newProjectList = projectInvitations.filter(
          (p) => p.id !== project.id,
        );
        // reset invitations
        setProjectInvitations(newProjectList);
        // close modal if there are no more invitations
        if (newProjectList.length === 0) {
          toggleAcceptanceDialog();
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  const rejectInvitation = useMutation(
    (project) => TeamAPI.rejectInvitation(project.project_id),
    {
      onSuccess: (response, project) => {
        // filter out rejected project
        const newProjectList = projectInvitations.filter(
          (p) => p.id !== project.id,
        );
        // reset invitations
        setProjectInvitations(newProjectList);
        // close modal if there are no more invitations
        if (newProjectList.length === 0) {
          toggleAcceptanceDialog();
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  return (
    <Root>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box>
          <Tooltip title="Profile">
            <ButtonBase id="profile-popper" onClick={handleClick}>
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
                      {auth?.name}
                    </TypographySubtitle1Medium>
                  </Stack>
                </StyledMenuItem>
                <Divider />

                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText disableTypography>
                    <Typography variant="body2">Profile</Typography>
                  </ListItemText>
                </MenuItem>

                {window.allowTeams && projectInvitations.length > 0 && (
                  <MenuItem onClick={openAcceptanceDialog}>
                    <ListItemIcon>
                      <Badge
                        badgeContent={projectInvitations.length}
                        sx={{
                          "& .MuiBadge-badge": {
                            color: "white",
                            backgroundColor: "red",
                            fontSize: 9,
                          },
                        }}
                      >
                        <GroupAdd fontSize="small" />
                      </Badge>
                    </ListItemIcon>
                    
                    <ListItemText disableTypography>
                      <Typography variant="body2">
                        Collaboration Invites
                      </Typography>
                    </ListItemText>
                  </MenuItem>
                )}

                <MenuItem id="signout" onClick={handleSignOut}>
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

      {window.allowTeams && (
        <InvitationsDialog
          open={onAcceptanceDialog}
          onClose={toggleAcceptanceDialog}
          userId={auth.id}
          projectInvitations={projectInvitations}
          handleAcceptance={acceptInvitation.mutate}
          handleRejection={rejectInvitation.mutate}
        />
      )}
    </Root>
  );
};

export default ProfilePopper;
