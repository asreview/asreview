import {
  LogoutOutlined,
  ManageAccountsOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import {
  Box,
  ClickAwayListener,
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
} from "@mui/material";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";

import { TypographySubtitle1Medium } from "StyledComponents/StyledTypography";

import { AuthAPI } from "api";
import { useAuth } from "hooks/useAuth";

import { InitialsAvatar } from "StyledComponents/InitialsAvatar";

const SignOutItem = () => {
  const queryClient = useQueryClient();

  const { mutate: handleSignOut } = useMutation(AuthAPI.signout, {
    onSuccess: () => {
      queryClient.invalidateQueries();
      window.location.replace(window.postLogoutUrl);
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
  const { isAdmin } = useAuth();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  const { data } = useQuery("user", AuthAPI.user, {
    retry: false,
    onError: (response) => {
      response.code === 401 && navigate("/signin");
    },
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((prev) => !prev);
  };

  const handleProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  const handleAdmin = () => {
    setOpen(false);
    navigate("/admin");
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
              color="secondary"
            >
              <InitialsAvatar name={data?.name} />
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
                {window.authentication && isAdmin && (
                  <MenuItem onClick={handleAdmin}>
                    <ListItemIcon>
                      <ManageAccountsOutlined fontSize="small" />
                    </ListItemIcon>
                    <ListItemText disableTypography>
                      <Typography variant="body2">Admin</Typography>
                    </ListItemText>
                  </MenuItem>
                )}
                <SignOutItem />
              </MenuList>
            </Paper>
          </Popper>
        </Box>
      </ClickAwayListener>
    </>
  );
};
export default ProfilePopper;
