import {
  GroupAddOutlined,
  LogoutOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  ClickAwayListener,
  DialogActions,
  DialogTitle,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";

import { TypographySubtitle1Medium } from "StyledComponents/StyledTypography";

import { AuthAPI, TeamAPI } from "api";

import { InvitationsComponent } from "ProjectComponents/TeamComponents";
import { InitialsAvatar } from "StyledComponents/InitialsAvatar";
import { StyledDialog } from "StyledComponents/StyledDialog";

import { useToggle } from "hooks/useToggle";

const SignOutItem = () => {
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const { mutate: handleSignOut } = useMutation(AuthAPI.signout, {
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate("/signin");
    },
  });

  return (
    <MenuItem id="signout" onClick={handleSignOut}>
      <ListItemIcon>
        <LogoutOutlined fontSize="small" />
      </ListItemIcon>
      <ListItemText disableTypography>
        <Typography variant="body2">Sign out</Typography>
      </ListItemText>
    </MenuItem>
  );
};

const ProfilePopper = () => {
  const navigate = useNavigate();
  const smallScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const [onAcceptanceDialog, toggleAcceptanceDialog] = useToggle();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  const { data } = useQuery("user", AuthAPI.user, {
    retry: false,
    onError: (response) => {
      response.code === 401 && navigate("/signin");
    },
  });

  const { data: invitations } = useQuery(
    ["getProjectInvitations"],
    () => TeamAPI.getProjectInvitations(),
    {
      refetchInterval: 30000,
    },
  );

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((prev) => !prev);
  };

  const openAcceptanceDialog = () => {
    setOpen(false);
    toggleAcceptanceDialog();
  };
  const handleProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  return (
    <>
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <Box>
          <Tooltip title="Profile">
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleClick}
              // color="inherit"
              color="secondary"
            >
              <Badge
                badgeContent={invitations?.invited_for_projects.length || 0}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: 9,
                    color: "white",
                    bgcolor: "red",
                  },
                }}
                invisible={!invitations?.invited_for_projects.length}
              >
                <InitialsAvatar name={data?.name} />
              </Badge>
            </IconButton>
          </Tooltip>
          <Popper
            open={open}
            anchorEl={anchorEl}
            placement="bottom-end"
            sx={{ zIndex: "tooltip" }}
          >
            <Paper elevation={5}>
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: "center", p: 2 }}
              >
                <TypographySubtitle1Medium>
                  {data?.name}
                </TypographySubtitle1Medium>
              </Stack>
              <Divider />

              <MenuList>
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <PersonOutlined fontSize="small" />
                  </ListItemIcon>
                  <ListItemText disableTypography>
                    <Typography variant="body2">Profile</Typography>
                  </ListItemText>
                </MenuItem>
                {invitations?.invited_for_projects.length > 0 && (
                  <MenuItem onClick={openAcceptanceDialog}>
                    <ListItemIcon>
                      <Badge
                        badgeContent={invitations?.invited_for_projects.length}
                        sx={{
                          "& .MuiBadge-badge": {
                            color: "white",
                            bgcolor: "red",
                            fontSize: 9,
                          },
                        }}
                      >
                        <GroupAddOutlined fontSize="small" />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText disableTypography>
                      <Typography variant="body2">Team invites</Typography>
                    </ListItemText>
                  </MenuItem>
                )}
                <SignOutItem />
              </MenuList>
            </Paper>
          </Popper>
        </Box>
      </ClickAwayListener>
      {invitations && (
        <StyledDialog
          aria-label="acceptance dialog"
          open={onAcceptanceDialog}
          fullScreen={smallScreen}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: { height: !smallScreen ? "calc(100% - 96px)" : "100%" },
          }}
          onClose={toggleAcceptanceDialog}
        >
          <DialogTitle>Team invitations</DialogTitle>
          <InvitationsComponent onEmpty={toggleAcceptanceDialog} />
          <DialogActions>
            <Button onClick={toggleAcceptanceDialog}>Close</Button>
          </DialogActions>
        </StyledDialog>
      )}
    </>
  );
};
export default ProfilePopper;
