import * as React from "react";
import {
  Avatar,
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
import { Logout } from "@mui/icons-material";

import { StyledMenuItem } from "../StyledComponents/StyledMenuItem";
import { TypographySubtitle1Medium } from "../StyledComponents/StyledTypography";

import useAuth from "../hooks/useAuth";
import ElasAvatar from "../images/ElasAvatar.svg";

const Root = styled("div")(({ theme }) => ({}));

const ProfilePopper = (props) => {
  const { auth, setAuth } = useAuth();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((prev) => !prev);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const handleSignOut = () => {
    setAuth({});
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
