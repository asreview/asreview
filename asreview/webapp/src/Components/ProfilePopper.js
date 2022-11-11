import * as React from "react";
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

import { AuthAPI, CollaborationAPI } from "../api";
import useAuth from "../hooks/useAuth";
import ElasAvatar from "../images/ElasAvatar.svg";

const Root = styled("div")(({ theme }) => ({}));

const ProfilePopper = (props) => {
  const { auth, setAuth } = useAuth();
  const [numberOfInvitations, setNumberOfInvitations] = React.useState(0);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  useQuery(
    ["getProjectInvitations"],
    () => CollaborationAPI.getProjectInvitations(auth.id),
    {
      onSuccess: (data) => {
        setNumberOfInvitations((data['invited_for_projects'] || []).length);
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
                  numberOfInvitations > 0 &&
                  <MenuItem onClick={handleSignOut}>
                    <ListItemIcon>
                      <GroupAdd fontSize="small" />
                    </ListItemIcon>
                    <ListItemText disableTypography>
                      <Typography variant="body2">
                        Collaboration Invites
                        <Badge 
                          badgeContent={numberOfInvitations}
                          sx={{"& .MuiBadge-badge": { color: "white", backgroundColor: "red"}}}
                        >
                          <MailIcon color="action" />
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
    </Root>
  );
};

export default ProfilePopper;
